import { useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { useOrderStore } from "../stores/useOrderStore";

const ORDER_STATUSES = ["confirmed", "out_for_delivery", "delivered", "cancelled"];

const OrdersTab = () => {
	const { orders, fetchAdminOrders, updateOrderStatus, updateOrderPaymentStatus, loading } = useOrderStore();

	useEffect(() => {
		fetchAdminOrders();
	}, [fetchAdminOrders]);

	const handleStatusChange = async (orderId, orderStatus) => {
		const updatedOrder = await updateOrderStatus(orderId, orderStatus);
		if (updatedOrder) fetchAdminOrders();
	};

	const handlePaymentChange = async (orderId, paymentStatus) => {
		const updatedOrder = await updateOrderPaymentStatus(orderId, paymentStatus);
		if (updatedOrder) fetchAdminOrders();
	};

	if (loading) return <div className='text-center text-gray-300'>Loading orders...</div>;

	return (
		<div className='mx-auto max-w-7xl rounded-lg bg-gray-800 p-4 shadow-lg sm:p-6'>
			<div className='mb-5 flex items-center gap-3'>
				<ClipboardList className='h-7 w-7 text-emerald-400' />
				<div>
					<h2 className='text-2xl font-semibold text-white'>Orders</h2>
					<p className='text-sm text-gray-400'>Manage Cash on Delivery fulfilment and payment collection.</p>
				</div>
			</div>

			{orders.length === 0 ? (
				<p className='py-8 text-center text-gray-400'>No orders yet.</p>
			) : (
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-gray-700 text-sm'>
						<thead className='bg-gray-700 text-left text-xs uppercase tracking-wider text-gray-300'>
							<tr>
								<th className='px-4 py-3'>Order / Customer</th>
								<th className='px-4 py-3'>Products</th>
								<th className='px-4 py-3'>Total</th>
								<th className='px-4 py-3'>Delivery</th>
								<th className='px-4 py-3'>Status</th>
								<th className='px-4 py-3'>Payment</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-700'>
							{orders.map((order) => (
								<tr key={order._id} className='align-top hover:bg-gray-700/40'>
									<td className='px-4 py-4 text-gray-300'>
										<p className='font-medium text-white'>#{order._id}</p>
										<p>{order.user?.name || "Customer"}</p>
										<p className='text-xs text-gray-500'>{order.user?.email}</p>
										<p className='mt-1 text-xs text-gray-500'>{new Date(order.createdAt).toLocaleString()}</p>
									</td>
									<td className='max-w-48 px-4 py-4 text-gray-300'>
										{order.products.map((item) => `${item.product?.name || "Product"} ×${item.quantity}`).join(", ")}
									</td>
									<td className='px-4 py-4 font-semibold text-emerald-400'>R{order.totalAmount.toFixed(2)}</td>
									<td className='px-4 py-4 text-gray-300'>
										<p>{order.deliveryLocation || "—"}</p>
										<p className='mt-1 text-xs text-gray-400'>{order.phoneNumber || "—"}</p>
									</td>
									<td className='px-4 py-4'>
										<select
											value={order.orderStatus}
											onChange={(event) => handleStatusChange(order._id, event.target.value)}
											className='rounded-md border border-gray-600 bg-gray-700 px-2 py-1.5 capitalize text-white focus:border-emerald-500 focus:outline-none'
										>
											{ORDER_STATUSES.map((status) => (
												<option key={status} value={status}>{status.replaceAll("_", " ")}</option>
											))}
										</select>
									</td>
									<td className='px-4 py-4'>
										<p className='mb-2 capitalize text-gray-300'>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}</p>
										{order.paymentMethod === "cod" ? (
											<select
												value={order.paymentStatus}
												onChange={(event) => handlePaymentChange(order._id, event.target.value)}
												className='rounded-md border border-gray-600 bg-gray-700 px-2 py-1.5 capitalize text-white focus:border-emerald-500 focus:outline-none'
											>
												<option value='pending'>Pending</option>
												<option value='paid'>Paid</option>
											</select>
										) : (
											<p className='capitalize text-emerald-400'>{order.paymentStatus}</p>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
