import { useEffect, useRef, useState } from "react";
import { BadgeCheck, LoaderCircle, LogIn, MailPlus, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";

import { useUserStore } from "../stores/useUserStore";

const VerifyEmailPage = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token") || "";
	const verifyEmail = useUserStore((state) => state.verifyEmail);
	const verificationAttempt = useRef("");
	const [status, setStatus] = useState(token ? "loading" : "error");
	const [message, setMessage] = useState(
		token ? "Verifying your email address..." : "This verification link is missing its token.",
	);

	useEffect(() => {
		if (!token) return;

		// React StrictMode runs effects twice in development. The token is one-time,
		// so ensure this browser session sends only one verification request per token.
		if (verificationAttempt.current === token) return;
		verificationAttempt.current = token;

		const verify = async () => {
			try {
				const response = await verifyEmail(token);
				setStatus("success");
				setMessage(response.message || "Email verified successfully.");
			} catch (error) {
				setStatus("error");
				setMessage(
					error.response?.data?.message ||
						"This verification link is no longer valid.",
				);
			}
		};

		verify();
	}, [token, verifyEmail]);

	const isLoading = status === "loading";
	const isSuccess = status === "success";

	return (
		<div className='page-shell flex min-h-screen items-center px-5 py-12 sm:px-6'>
			<motion.main
				className='premium-panel mx-auto w-full max-w-lg rounded-3xl p-7 text-center sm:p-10'
				initial={{ opacity: 0, scale: 0.96, y: 18 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				aria-live='polite'
			>
				<div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border ${isLoading || isSuccess ? "border-emerald-300/25 bg-emerald-400/10" : "border-rose-300/25 bg-rose-400/10"}`}>
					{isLoading && <LoaderCircle className='h-10 w-10 animate-spin text-emerald-300' aria-hidden='true' />}
					{isSuccess && <BadgeCheck className='h-11 w-11 text-emerald-300' aria-hidden='true' />}
					{status === "error" && <ShieldAlert className='h-10 w-10 text-rose-300' aria-hidden='true' />}
				</div>

				<p className={`mt-7 text-sm font-bold tracking-[0.16em] ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>
					{isLoading ? "SECURE VERIFICATION" : isSuccess ? "ACCOUNT ACTIVATED" : "LINK NOT VALID"}
				</p>
				<h1 className='mt-2 text-3xl font-black tracking-tight text-white'>
					{isLoading ? "Verifying your email" : isSuccess ? "Email verified 🎉" : "Verification link invalid or expired"}
				</h1>
				<p className='mt-4 leading-7 text-slate-300'>{message}</p>

				{!isLoading && (
					<Link
						to={isSuccess ? "/login" : "/check-email"}
						className='mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_10px_28px_rgba(16,185,129,0.2)] transition hover:bg-emerald-400'
					>
						{isSuccess ? <LogIn className='mr-2 h-5 w-5' aria-hidden='true' /> : <MailPlus className='mr-2 h-5 w-5' aria-hidden='true' />}
						{isSuccess ? "Log In" : "Resend verification email"}
					</Link>
				)}
			</motion.main>
		</div>
	);
};

export default VerifyEmailPage;
