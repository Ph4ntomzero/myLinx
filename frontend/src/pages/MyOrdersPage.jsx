import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, MapPin } from "lucide-react";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "../components/LoadingSpinner";

const MyOrdersPage = () => {
	const { orders, fetchMyOrders, loading } = useOrderStore();

	useEffect(() => {
		fetchMyOrders();
	}, [fetchMyOrders]);

	if (loading) return <LoadingSpinner />;

	return (
		<div className='page-shell'>
			<div className='relative z-10 mx-auto max-w-4xl px-5 py-12 sm:px-8'>
				<div className='mb-7 flex items-center gap-3'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/20'><ClipboardList className='h-6 w-6 text-emerald-400' /></div>
					<div><p className='text-sm font-semibold text-emerald-300'>Order history</p><h1 className='text-3xl font-black text-white'>My Orders</h1></div>
				</div>

				{orders.length === 0 ? (
					<div className='premium-panel rounded-2xl p-8 text-center shadow-lg'>
						<p className='text-gray-300'>You have not placed any orders yet.</p>
						<Link to='/' className='mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'>
							Continue Shopping
						</Link>
					</div>
				) : (
					<div className='space-y-4'>
						{orders.map((order) => (
							<div key={order._id} className='soft-card rounded-2xl p-5 transition hover:border-emerald-400/40'>
								<div className='flex flex-wrap items-start justify-between gap-3'>
									<div>
										<p className='font-semibold text-white'>Order #{order._id}</p>
										<p className='mt-1 text-sm text-gray-400'>{new Date(order.createdAt).toLocaleDateString()}</p>
									</div>
									<p className='text-lg font-bold text-emerald-400'>R{order.totalAmount.toFixed(2)}</p>
								</div>
								<div className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
									<Info label='Payment' value={order.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"} />
									<Info label='Payment Status' value={order.paymentStatus} />
									<Info label='Order Status' value={order.orderStatus.replaceAll("_", " ")} />
									<Info label='Delivery' value={order.deliveryLocation || "Not applicable"} icon={<MapPin className='h-4 w-4' />} />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

const Info = ({ label, value, icon }) => (
	<div>
		<p className='text-gray-500'>{label}</p>
		<p className='mt-1 flex items-center gap-1 capitalize text-gray-200'>{icon}{value}</p>
	</div>
);

export default MyOrdersPage;
