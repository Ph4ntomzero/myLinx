import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useOrderStore = create((set) => ({
	orders: [],
	currentOrder: null,
	loading: false,

	createCODOrder: async (deliveryData) => {
		set({ loading: true });
		try {
			const response = await axios.post("/orders/cod", deliveryData);
			const order = response.data?.order;
			if (!order?._id) {
				throw new Error("The order was not confirmed by the server");
			}

			// Only report success after the API can retrieve the order it just created.
			// This prevents stale or incomplete API responses from looking like a
			// completed checkout while no order exists in the customer's history.
			const confirmationResponse = await axios.get(`/orders/${order._id}`);
			const confirmedOrder = confirmationResponse.data?.order;
			if (!confirmedOrder?._id) {
				throw new Error("The order could not be confirmed after checkout");
			}

			set({ currentOrder: confirmedOrder });
			toast.success("Cash on Delivery order placed");
			return confirmedOrder;
		} catch (error) {
			toast.error(
				error.response?.data?.message || error.message || "Your order was not confirmed. Please try again.",
			);
			return null;
		} finally {
			set({ loading: false });
		}
	},

	fetchMyOrders: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/orders/my-orders");
			set({ orders: response.data.orders });
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to fetch your orders");
		} finally {
			set({ loading: false });
		}
	},

	fetchOrder: async (orderId) => {
		set({ loading: true });
		try {
			const response = await axios.get(`/orders/${orderId}`);
			set({ currentOrder: response.data.order });
			return response.data.order;
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to fetch this order");
			return null;
		} finally {
			set({ loading: false });
		}
	},

	fetchAdminOrders: async () => {
		set({ loading: true });
		try {
			const response = await axios.get("/orders/admin");
			set({ orders: response.data.orders });
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to fetch orders");
		} finally {
			set({ loading: false });
		}
	},

	updateOrderStatus: async (orderId, orderStatus) => {
		try {
			const response = await axios.patch(`/orders/${orderId}/status`, { orderStatus });
			toast.success("Order status updated");
			return response.data.order;
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to update order status");
			return null;
		}
	},

	updateOrderPaymentStatus: async (orderId, paymentStatus) => {
		try {
			const response = await axios.patch(`/orders/${orderId}/payment`, { paymentStatus });
			toast.success("Payment status updated");
			return response.data.order;
		} catch (error) {
			toast.error(error.response?.data?.message || "Unable to update payment status");
			return null;
		}
	},
}));
