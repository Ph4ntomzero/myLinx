import { CheckCircle, MapPin, PackageCheck, Truck } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Confetti from "react-confetti";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "../components/LoadingSpinner";

const OrderSuccessPage = () => {
	const { orderId } = useParams();
	const { state } = useLocation();
	const { currentOrder, fetchOrder, loading } = useOrderStore();
	const order = state?.order || (currentOrder?._id === orderId ? currentOrder : null);

	useEffect(() => {
		if (!state?.order) fetchOrder(orderId);
	}, [fetchOrder, orderId, state?.order]);

	if (loading && !order) return <LoadingSpinner />;

	if (!order) {
		return (
			<div className='flex min-h-screen items-center justify-center px-4'>
				<div className='max-w-md rounded-lg bg-gray-800 p-6 text-center shadow-xl'>
					<h1 className='text-2xl font-bold text-gray-100'>Order unavailable</h1>
					<p className='mt-2 text-gray-400'>We could not find that order.</p>
					<Link to='/' className='mt-5 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'>
						Continue Shopping
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='page-shell flex min-h-screen items-center justify-center px-4 py-12'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={500}
				recycle={false}
			/>
			<div className='premium-panel relative z-10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='mb-4 h-16 w-16 text-emerald-400' />
					</div>
					<h1 className='text-center text-3xl font-bold text-emerald-400'>🎉 Order Confirmed!</h1>
					<p className='mt-2 text-center text-gray-300'>Your order has been placed successfully.</p>

					<div className='mt-6 space-y-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4'>
						<DetailRow label='Order ID' value={`#${order._id}`} />
						<DetailRow label='Payment Method' value='Cash on Delivery' />
						<DetailRow label='Total' value={`R${order.totalAmount.toFixed(2)}`} valueClassName='text-emerald-400' />
						<div className='flex items-start justify-between gap-4 border-t border-gray-600 pt-4'>
							<span className='text-sm text-gray-400'>Delivery Location</span>
							<span className='flex items-center gap-1 text-right text-sm font-semibold text-emerald-400'>
								<MapPin className='h-4 w-4' />
								{order.deliveryLocation}
							</span>
						</div>
					</div>

					<div className='mt-5 flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-gray-200'>
						<Truck className='h-5 w-5 shrink-0 text-emerald-400' />
						<p>Pay when your order is delivered. Please have the exact amount ready.</p>
					</div>

					<div className='mt-6 grid gap-3 sm:grid-cols-2'>
						<Link to='/' className='flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700'>
							Continue Shopping
						</Link>
						<Link to='/orders' className='flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white hover:bg-gray-500'>
							<PackageCheck className='h-5 w-5' />
							View My Orders
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

const DetailRow = ({ label, value, valueClassName = "text-white" }) => (
	<div className='flex items-center justify-between gap-4'>
		<span className='text-sm text-gray-400'>{label}</span>
		<span className={`text-right text-sm font-semibold ${valueClassName}`}>{value}</span>
	</div>
);

export default OrderSuccessPage;
