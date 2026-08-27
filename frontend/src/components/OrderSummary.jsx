import { useState } from "react";
import { Banknote, CreditCard, MoveRight, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import CODCheckoutModal from "./CODCheckoutModal";

const DELIVERY_FEE = 0;

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied } = useCartStore();
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = (total + DELIVERY_FEE).toFixed(2);
	const formattedSavings = savings.toFixed(2);

	return (
		<>
			<motion.div
				className='premium-panel space-y-5 rounded-2xl p-5 shadow-sm sm:p-6'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

				<div className='space-y-2'>
					<SummaryLine label='Original price' value={`R${formattedSubtotal}`} />
					{savings > 0 && (
						<SummaryLine label='Savings' value={`-R${formattedSavings}`} valueClassName='text-emerald-400' />
					)}
					{coupon && isCouponApplied && (
						<SummaryLine
							label={`Coupon (${coupon.code})`}
							value={`-${coupon.discountPercentage}%`}
							valueClassName='text-emerald-400'
						/>
					)}
					<SummaryLine label='Delivery' value='Free' valueClassName='text-emerald-400' />
					<div className='flex items-center justify-between gap-4 border-t border-gray-600 pt-3'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>R{formattedTotal}</dd>
					</div>
				</div>

				<div className='border-t border-slate-700 pt-5'>
					<h2 className='mb-3 text-base font-semibold text-white'>Payment Method</h2>
					<div className='space-y-3'>
						<div className='rounded-lg border border-emerald-500 bg-emerald-500/10 p-4'>
							<div className='flex items-start gap-3'>
								<div className='mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-gray-900'>
									✓
								</div>
								<Banknote className='mt-0.5 h-5 w-5 text-emerald-400' />
								<div>
									<p className='font-medium text-white'>Cash on Delivery</p>
									<p className='mt-1 text-sm text-gray-300'>Pay with cash when your order arrives.</p>
									<p className='mt-1 text-sm text-gray-400'>Free delivery to Unibell 1, 2 and 3 Gates.</p>
								</div>
							</div>
						</div>

						<div className='cursor-not-allowed rounded-xl border border-slate-700 bg-slate-950/40 p-4 opacity-60'>
							<div className='flex items-start gap-3'>
								<div className='mt-0.5 h-5 w-5 rounded-full border border-gray-500' />
								<CreditCard className='mt-0.5 h-5 w-5 text-gray-400' />
								<div>
									<p className='font-medium text-gray-300'>Card Payment</p>
									<p className='mt-1 text-sm text-gray-400'>Coming Soon</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm text-gray-300'>
					<div className='flex gap-2'>
						<Truck className='h-5 w-5 shrink-0 text-emerald-400' />
						<p>Please make sure someone is available to receive the order at your selected gate.</p>
					</div>
				</div>

				<motion.button
					className='flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.18)] hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/30'
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setIsCheckoutOpen(true)}
				>
					Place Order - Cash on Delivery
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link to='/' className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</motion.div>

			{isCheckoutOpen && <CODCheckoutModal onClose={() => setIsCheckoutOpen(false)} />}
		</>
	);
};

const SummaryLine = ({ label, value, valueClassName = "text-white" }) => (
	<dl className='flex items-center justify-between gap-4'>
		<dt className='text-base font-normal text-gray-300'>{label}</dt>
		<dd className={`text-base font-medium ${valueClassName}`}>{value}</dd>
	</dl>
);

export default OrderSummary;
