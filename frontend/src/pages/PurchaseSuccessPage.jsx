import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";

const PurchaseSuccessPage = () => {
	const searchParams = new URLSearchParams(window.location.search);
	const paymentReference = searchParams.get("reference") || searchParams.get("trxref");
	const [isProcessing, setIsProcessing] = useState(() => Boolean(paymentReference));
	const { clearCart } = useCartStore();
	const [error, setError] = useState(() =>
		paymentReference ? null : "No Paystack payment reference was found in the URL",
	);
	const [orderId, setOrderId] = useState(null);

	useEffect(() => {
		const handleCheckoutSuccess = async (reference) => {
			try {
				const response = await axios.post("/payments/checkout-success", {
					reference,
				});
				setOrderId(response.data.orderId);
				clearCart();
			} catch (error) {
				setError(error.response?.data?.message || "We could not verify this payment");
			} finally {
				setIsProcessing(false);
			}
		};

		if (paymentReference) handleCheckoutSuccess(paymentReference);
	}, [clearCart, paymentReference]);

	if (isProcessing) return "Processing...";

	if (error) {
		return (
			<div className='page-shell flex min-h-screen items-center justify-center px-4'>
				<div className='premium-panel w-full max-w-md rounded-2xl p-6 text-center shadow-xl'>
					<h1 className='mb-2 text-2xl font-bold text-red-400'>Payment verification failed</h1>
					<p className='text-gray-300'>{error}</p>
					<Link to='/cart' className='mt-6 inline-flex rounded-lg bg-gray-700 px-4 py-2 text-emerald-400 hover:bg-gray-600'>
						Return to cart
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='page-shell flex min-h-screen items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='premium-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-xl'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						Purchase Successful!
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						Thank you for your order. {"We're"} processing it now.
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>
					<div className='mb-6 rounded-xl border border-slate-700 bg-slate-900/70 p-4'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-sm text-gray-400'>Order number</span>
							<span className='text-sm font-semibold text-emerald-400'>#{orderId}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-gray-400'>Estimated delivery</span>
							<span className='text-sm font-semibold text-emerald-400'>3-5 business days</span>
						</div>
					</div>

					<div className='space-y-4'>
						<button
							className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center'
						>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;
