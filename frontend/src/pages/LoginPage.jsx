import { Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Loader, LogIn, MailWarning } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';



const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);

  const {login, loading, resendVerification, resendingVerification} = useUserStore();


  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    setRequiresVerification(result?.requiresVerification === true);
  };

  const handleResend = async () => {
    await resendVerification(email.trim().toLowerCase());
  };

  return  ( 
  <div className="page-shell flex min-h-screen flex-col justify-center px-5 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-center text-sm font-semibold text-emerald-300">Welcome back</p>
          <h2 className="mt-2 text-center text-3xl font-black text-white">
            Login to my<span className="text-emerald-400">Linx</span>
          </h2>
        </motion.div>
        <motion.div
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="premium-panel rounded-2xl py-8 px-4 shadow sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">

  
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="email"
                    required
                    id="email"
                    className="site-input block w-full rounded-xl py-2.5 pl-10 pr-3 placeholder-gray-400 sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setRequiresVerification(false);
                    }}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="password"
                    required
                    id="password"
                    className="site-input block w-full rounded-xl py-2.5 pl-10 pr-3 placeholder-gray-400 sm:text-sm"
                    placeholder="*********"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />
                </div>
              </div>

  
              <button
                type="submit"
                className="flex min-h-12 w-full justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_10px_28px_rgba(16,185,129,0.2)] transition hover:bg-emerald-400 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader
                      className="mr-2 h-5 w-5 animate-spin"
                      aria-hidden="true"
                    />
                    Loading
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                    Login
                  </>
                )}
              </button>
            </form>

            {requiresVerification && (
              <div className="mt-5 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4" role="alert">
                <div className="flex gap-3">
                  <MailWarning className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-amber-100">Your email has not been verified yet.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">Open the link in your inbox, or request a fresh one below.</p>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendingVerification}
                      className="mt-3 inline-flex items-center font-bold text-emerald-300 transition hover:text-emerald-200 disabled:opacity-60"
                    >
                      {resendingVerification && <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                      Resend verification email
                    </button>
                  </div>
                </div>
              </div>
            )}
  
            <p className="mt-8 text-center text-sm text-gray-400">
              Not a Member ?{" "}
              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Sign Up now <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
  );
};
export default LoginPage
