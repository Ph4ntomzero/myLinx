import { XCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PurchaseCancelPage = () => {
	return (
		<div className='page-shell flex min-h-screen items-center justify-center px-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='premium-panel relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-xl'
			>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<XCircle className='text-red-500 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-red-500 mb-2'>Purchase Cancelled</h1>
					<p className='text-gray-300 text-center mb-6'>
						Your order has been cancelled. No charges have been made.
					</p>
					<div className='rounded-xl border border-slate-700 bg-slate-900/70 p-4 mb-6'>
						<p className='text-sm text-gray-400 text-center'>
							If you encountered any issues during the checkout process, please don&apos;t hesitate to
							contact our support team.
						</p>
					</div>
					<div className='space-y-4'>
						<Link
							to={"/"}
							className='flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 font-bold text-slate-100 transition hover:bg-slate-700'
						>
							<ArrowLeft className='mr-2' size={18} />
							Return to Shop
						</Link>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default PurchaseCancelPage;
