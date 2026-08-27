import { useEffect, useState } from "react";
import { Gift, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
	const { coupon, isCouponApplied, getMyCoupon, applyCoupon, removeCoupon } = useCartStore();
	const [code, setCode] = useState("");

	useEffect(() => {
		getMyCoupon();
	}, [getMyCoupon]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const couponCode = code.trim() || coupon?.code;
		if (couponCode) applyCoupon(couponCode);
	};

	return (
		<motion.div
			className='premium-panel rounded-2xl p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<div className='mb-4 flex items-center gap-3'>
				<Gift className='h-6 w-6 text-emerald-400' />
				<div>
					<h2 className='font-semibold text-white'>Have a coupon?</h2>
					{coupon && !isCouponApplied && (
						<p className='text-sm text-gray-400'>A {coupon.discountPercentage}% coupon is available.</p>
					)}
				</div>
			</div>

			{isCouponApplied ? (
				<div className='flex items-center justify-between rounded-xl bg-emerald-950/50 p-3'>
					<span className='text-sm text-emerald-300'>Coupon {coupon.code} applied</span>
					<button
						type='button'
						onClick={removeCoupon}
						className='text-sm font-medium text-gray-300 underline hover:text-white'
					>
						Remove
					</button>
				</div>
			) : (
				<form onSubmit={handleSubmit} className='flex gap-2'>
					<div className='relative flex-1'>
						<Ticket className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
						<input
							value={code}
							onChange={(event) => setCode(event.target.value)}
							placeholder={coupon?.code || "Enter coupon code"}
							className='site-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400'
						/>
					</div>
					<button
						type='submit'
						disabled={!code.trim() && !coupon?.code}
						className='rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50'
					>
						Apply
					</button>
				</form>
			)}
		</motion.div>
	);
};

export default GiftCouponCard;
