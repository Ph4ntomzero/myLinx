import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import { sendAdminOrderNotification } from "../lib/email.js";
import Order, { DELIVERY_LOCATIONS, ORDER_STATUSES } from "../models/order.model.js";
import Product from "../models/product.model.js";

const DELIVERY_FEE = 0;
const SOUTH_AFRICAN_PHONE_PATTERN = /^(?:0\d{9}|\+27\d{9})$/;

export const createCodOrder = async (req, res) => {
	try {
		const { phoneNumber, deliveryLocation, orderNote = "", checkoutId, couponCode } = req.body;

		if (!DELIVERY_LOCATIONS.includes(deliveryLocation)) {
			return res.status(400).json({ message: "Invalid delivery location" });
		}

		if (!phoneNumber) {
			return res.status(400).json({ message: "Phone number is required" });
		}

		const normalizedPhoneNumber = String(phoneNumber).replace(/[\s()-]/g, "");
		if (!SOUTH_AFRICAN_PHONE_PATTERN.test(normalizedPhoneNumber)) {
			return res.status(400).json({ message: "Enter a valid South African phone number" });
		}

		if (typeof orderNote !== "string" || orderNote.length > 500) {
			return res.status(400).json({ message: "Order note must be 500 characters or fewer" });
		}

		if (typeof checkoutId !== "string" || !/^[a-zA-Z0-9-]{10,100}$/.test(checkoutId)) {
			return res.status(400).json({ message: "Invalid checkout request" });
		}

		const existingOrder = await Order.findOne({ codCheckoutId: checkoutId });
		if (existingOrder) {
			if (existingOrder.user.toString() !== req.user._id.toString()) {
				return res.status(403).json({ message: "This checkout request belongs to another user" });
			}

			return res.status(200).json({
				message: "Order already placed",
				order: existingOrder,
			});
		}

		if (req.user.cartItems.length === 0) {
			return res.status(400).json({ message: "Cart is empty" });
		}

		const quantitiesByProductId = new Map();
		for (const item of req.user.cartItems) {
			const productId = item.product.toString();
			if (!mongoose.isValidObjectId(productId) || !Number.isInteger(item.quantity) || item.quantity < 1) {
				return res.status(400).json({ message: "Cart contains invalid product data" });
			}

			quantitiesByProductId.set(productId, (quantitiesByProductId.get(productId) || 0) + item.quantity);
		}

		const catalogProducts = await Product.find({
			_id: { $in: [...quantitiesByProductId.keys()] },
		}).lean();

		if (catalogProducts.length !== quantitiesByProductId.size) {
			return res.status(400).json({ message: "A product in your cart is no longer available" });
		}

		const products = catalogProducts.map((product) => ({
			product: product._id,
			quantity: quantitiesByProductId.get(product._id.toString()),
			price: product.price,
		}));
		const subtotal = products.reduce((total, product) => total + product.price * product.quantity, 0);

		if (couponCode && typeof couponCode !== "string") {
			return res.status(400).json({ message: "Invalid coupon" });
		}

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({
				code: couponCode,
				userId: req.user._id,
				isActive: true,
				expirationDate: { $gt: new Date() },
			});
			if (!coupon) return res.status(400).json({ message: "Coupon is no longer valid" });
		}
		const discountAmount = coupon
			? Math.round(subtotal * (coupon.discountPercentage / 100) * 100) / 100
			: 0;
		const totalAmount = subtotal - discountAmount + DELIVERY_FEE;

		const newOrder = new Order({
			user: req.user._id,
			products,
			totalAmount,
			deliveryFee: DELIVERY_FEE,
			paymentMethod: "cod",
			paymentStatus: "pending",
			orderStatus: "confirmed",
			deliveryLocation,
			phoneNumber: normalizedPhoneNumber,
			orderNote: orderNote.trim(),
			codCheckoutId: checkoutId,
		});

		try {
			await newOrder.save();
		} catch (error) {
			if (error?.code !== 11000) throw error;

			const duplicateOrder = await Order.findOne({ codCheckoutId: checkoutId });
			return res.status(200).json({
				message: "Order already placed",
				order: duplicateOrder,
			});
		}

		if (coupon) {
			coupon.isActive = false;
			await coupon.save();
		}

		// The cart is cleared only after the COD order has been persisted.
		req.user.cartItems = [];
		await req.user.save();

		const productNamesById = new Map(
			catalogProducts.map((product) => [product._id.toString(), product.name]),
		);
		// This runs after the order is saved and cannot make a checkout fail.
		void sendAdminOrderNotification({
			order: newOrder,
			customer: req.user,
			productNamesById,
		});

		res.status(201).json({
			message: "Cash on Delivery order placed successfully",
			order: newOrder,
		});
	} catch (error) {
		console.error("Error creating COD order:", error.message);
		res.status(500).json({ message: "Unable to place Cash on Delivery order" });
	}
};

export const getMyOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.populate("products.product", "name image")
			.sort({ createdAt: -1 });
		res.json({ orders });
	} catch (error) {
		console.error("Error fetching customer orders:", error.message);
		res.status(500).json({ message: "Unable to fetch orders" });
	}
};

export const getOrderById = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const order = await Order.findById(req.params.id).populate("products.product", "name image");
		if (!order) return res.status(404).json({ message: "Order not found" });
		if (order.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Access denied" });
		}

		res.json({ order });
	} catch (error) {
		console.error("Error fetching order:", error.message);
		res.status(500).json({ message: "Unable to fetch order" });
	}
};

export const getAdminOrders = async (req, res) => {
	try {
		const orders = await Order.find({})
			.populate("user", "name email")
			.populate("products.product", "name image")
			.sort({ createdAt: -1 });
		res.json({ orders });
	} catch (error) {
		console.error("Error fetching admin orders:", error.message);
		res.status(500).json({ message: "Unable to fetch orders" });
	}
};

export const updateOrderStatus = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const { orderStatus } = req.body;
		if (!ORDER_STATUSES.includes(orderStatus)) {
			return res.status(400).json({ message: "Invalid order status" });
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		order.orderStatus = orderStatus;
		await order.save();
		res.json({ message: "Order status updated", order });
	} catch (error) {
		console.error("Error updating order status:", error.message);
		res.status(500).json({ message: "Unable to update order status" });
	}
};

export const updateOrderPaymentStatus = async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid order ID" });
		}

		const { paymentStatus } = req.body;
		if (!['pending', 'paid'].includes(paymentStatus)) {
			return res.status(400).json({ message: "Invalid payment status" });
		}

		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });
		if (order.paymentMethod !== "cod") {
			return res.status(400).json({ message: "Only COD payments can be updated manually" });
		}

		order.paymentStatus = paymentStatus;
		await order.save();
		res.json({ message: "Payment status updated", order });
	} catch (error) {
		console.error("Error updating payment status:", error.message);
		res.status(500).json({ message: "Unable to update payment status" });
	}
};
