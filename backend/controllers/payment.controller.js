import axios from "axios";
import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import { sendAdminOrderNotification } from "../lib/email.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({
				message: "Invalid or empty product data",
			});
		}

		const requestedProducts = new Map();
		for (const product of products) {
			const productId = product._id || product.id;
			const quantity = product.quantity;

			if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1) {
				return res.status(400).json({ message: "Invalid product data" });
			}

			requestedProducts.set(productId, (requestedProducts.get(productId) || 0) + quantity);
		}

		const catalogProducts = await Product.find({
			_id: { $in: [...requestedProducts.keys()] },
		}).lean();

		if (catalogProducts.length !== requestedProducts.size) {
			return res.status(400).json({ message: "One or more products are no longer available" });
		}

		const orderProducts = catalogProducts.map((product) => ({
			id: product._id.toString(),
			quantity: requestedProducts.get(product._id.toString()),
			price: product.price,
		}));

		// Prices must come from the catalog, never from values sent by the browser.
		let totalAmount = orderProducts.reduce((total, product) => {
			return total + Math.round(product.price * 100) * product.quantity;
		}, 0);

		// Check coupon
		let coupon = null;

		if (couponCode) {
			coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
			});

			if (coupon && coupon.expirationDate > new Date()) {
				totalAmount -= Math.round(
					(totalAmount * coupon.discountPercentage) / 100
				);
			} else {
				coupon = null;
			}
		}

		if (totalAmount <= 0) {
			return res.status(400).json({
				message: "Invalid payment amount",
			});
		}

		// Paystack transaction initialization
		const response = await axios.post(
			"https://api.paystack.co/transaction/initialize",
			{
				email: req.user.email,
				amount: totalAmount,
				currency: "ZAR",

				// Where Paystack sends the user after payment
				callback_url: `${process.env.CLIENT_URL}/purchase-success`,

				metadata: {
					userId: req.user._id.toString(),
					couponCode: coupon?.code || "",
					products: orderProducts,
					totalAmount,
				},
			},
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
					"Content-Type": "application/json",
				},
			}
		);

		// Create coupon after a large purcha

		res.status(200).json({
			authorization_url: response.data.data.authorization_url,
			reference: response.data.data.reference,
			totalAmount: totalAmount / 100,
		});
	} catch (error) {
		console.error(
			"Error creating Paystack checkout:",
			error.response?.data || error.message
		);

		res.status(500).json({
			message: "Error processing payment",
		});
	}
};
export const checkoutSuccess = async (req, res) => {
	try {
		const { reference } = req.body;

		if (!reference || typeof reference !== "string") {
			return res.status(400).json({
				message: "Payment reference is required",
			});
		}

		const existingOrder = await Order.findOne({ paystackReference: reference });
		if (existingOrder) {
			if (existingOrder.user.toString() !== req.user._id.toString()) {
				return res.status(403).json({ message: "This payment belongs to another user" });
			}

			await clearUserCart(req.user._id);
			return res.status(200).json({
				success: true,
				message: "Payment was already processed",
				orderId: existingOrder._id,
			});
		}

		const response = await axios.get(
			`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				},
			}
		);

		const transaction = response.data.data;

		if (transaction.status !== "success") {
			return res.status(400).json({
				message: "Payment was not successful",
			});
		}

		const metadata =
			typeof transaction.metadata === "string"
				? JSON.parse(transaction.metadata)
				: transaction.metadata;
		const recordedTotal = Number(metadata?.totalAmount);
		const hasRecordedTotal = Number.isInteger(recordedTotal);

		if (
			!metadata ||
			metadata.userId !== req.user._id.toString() ||
			!Array.isArray(metadata.products) ||
			// Older, already-initialized payments have no totalAmount in metadata.
			// New payments must match the amount calculated by the server.
			(hasRecordedTotal && transaction.amount !== recordedTotal)
		) {
			return res.status(400).json({ message: "Payment verification data is invalid" });
		}

		const newOrder = new Order({
			user: req.user._id,
			products: metadata.products.map((product) => ({
				product: product.id,
				quantity: product.quantity,
				price: product.price,
			})),
			totalAmount: transaction.amount / 100,
			paystackReference: reference,
		});

		try {
			await newOrder.save();
		} catch (error) {
			if (error?.code !== 11000) throw error;

			const duplicateOrder = await Order.findOne({ paystackReference: reference });
			await clearUserCart(req.user._id);
			return res.status(200).json({
				success: true,
				message: "Payment was already processed",
				orderId: duplicateOrder._id,
			});
		}

		if (metadata.couponCode) {
			await Coupon.findOneAndUpdate(
				{ code: metadata.couponCode, userId: req.user._id },
				{ isActive: false },
			);
		}

		await clearUserCart(req.user._id);

		const orderedProducts = await Product.find({
			_id: { $in: newOrder.products.map((item) => item.product) },
		})
			.select("name")
			.lean();
		const productNamesById = new Map(
			orderedProducts.map((product) => [product._id.toString(), product.name]),
		);
		// A notification failure must never affect an already verified payment.
		void sendAdminOrderNotification({
			order: newOrder,
			customer: req.user,
			productNamesById,
		});

		res.status(200).json({
			success: true,
			message: "Payment successful and order created",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error(
			"Error verifying Paystack payment:",
			error.response?.data || error.message
		);

		res.status(500).json({
			message: "Error verifying payment",
		});
	}
};

async function clearUserCart(userId) {
	await User.findByIdAndUpdate(userId, { cartItems: [] });
}
