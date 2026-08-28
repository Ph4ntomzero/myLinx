import { useState } from "react";
import { ArrowLeft, Loader, MailCheck, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";

const CheckEmailPage = () => {
	const location = useLocation();
	const [email, setEmail] = useState(location.state?.email || "");
	const [resent, setResent] = useState(false);
	const emailDeliveryFailed = location.state?.emailDeliveryFailed === true && !resent;
	const { resendVerification, resendingVerification } = useUserStore();

	const handleResend = async () => {
		const sent = await resendVerification(email.trim().toLowerCase());
		if (sent) setResent(true);
	};

	return (
		<div className='page-shell flex min-h-screen items-center px-5 py-12 sm:px-6'>
			<motion.main
				className='premium-panel relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl p-6 sm:p-10'
				initial={{ opacity: 0, y: 22 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.55 }}
			>
				<div className='absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl' aria-hidden='true' />
				<div className='relative'>
					<div className='flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10'>
						<MailCheck className='h-8 w-8 text-emerald-300' aria-hidden='true' />
					</div>

					<p className='mt-7 text-sm font-bold tracking-[0.16em] text-emerald-300'>ONE MORE STEP</p>
					<h1 className='mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl'>
						{emailDeliveryFailed ? "Request your verification email" : "Check your email"}
					</h1>
					<p className='mt-4 text-base leading-7 text-slate-300'>
						{emailDeliveryFailed
							? "Your account was created, but we could not deliver the first email. Request a fresh verification link below."
							: "We've sent a verification link to your email address. Click it to activate your myLinx account."}
					</p>

					<div className='mt-6 rounded-2xl border border-slate-700/80 bg-slate-950/30 p-4'>
						<label htmlFor='verification-email' className='block text-sm font-semibold text-slate-200'>
							{emailDeliveryFailed ? "Email address" : "Verification email sent to"}
						</label>
						<input
							id='verification-email'
							type='email'
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder='you@example.com'
							className='site-input mt-2 block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-500'
						/>
					</div>

					<div className='mt-5 flex items-start gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/8 p-4'>
						<div className='mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-400' aria-hidden='true' />
						<p className='text-sm leading-6 text-slate-300'>The link expires in 1 hour. Check your spam folder if it does not arrive within a few minutes.</p>
					</div>

					<div className='mt-8 grid gap-3 sm:grid-cols-2'>
						<button
							type='button'
							onClick={handleResend}
							disabled={resendingVerification || !email.trim()}
							className='inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_10px_28px_rgba(16,185,129,0.2)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50'
						>
							{resendingVerification ? <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' /> : <RefreshCw className='mr-2 h-5 w-5' aria-hidden='true' />}
							Resend email
						</button>
						<Link
							to='/login'
							className='inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800'
						>
							<ArrowLeft className='mr-2 h-5 w-5' aria-hidden='true' />
							Back to Login
						</Link>
					</div>
				</div>
			</motion.main>
		</div>
	);
};

export default CheckEmailPage;
