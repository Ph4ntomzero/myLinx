import { LogIn, LogOut, Lock, ShoppingCart, UserPlus } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

const navLinkClass = ({ isActive }) =>
	`relative py-2 text-sm font-semibold transition sm:text-base ${isActive ? "text-emerald-400 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-emerald-400" : "text-slate-300 hover:text-white"}`;

const Navbar = () => {
	const { user, logout } = useUserStore();
	const { cart } = useCartStore();
	const isAdmin = user?.role === "admin";

	return (
		<header className='fixed left-0 top-0 z-50 w-full border-b border-slate-800/90 bg-[#030b10]/92 backdrop-blur-xl'>
			<div className='mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-10'>
				<Link to='/' className='text-2xl font-black tracking-tight text-white sm:text-3xl'>
					my<span className='text-emerald-400'>Linx</span>
				</Link>

				<nav className='flex flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-6'>
					<NavLink to='/' end className={navLinkClass}>Home</NavLink>
					{user && <NavLink to='/orders' className={navLinkClass}>Orders</NavLink>}
					{user && (
						<NavLink to='/cart' className={navLinkClass}>
							<span className='relative inline-flex items-center gap-1.5'>
								<ShoppingCart className='h-5 w-5' /> Cart
								{cart.length > 0 && <span className='absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-black text-slate-950'>{cart.length}</span>}
							</span>
						</NavLink>
					)}
					{isAdmin && (
						<NavLink to='/secret-dashboard' className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400'>
							<Lock className='h-4 w-4' /> <span className='hidden sm:inline'>Dashboard</span>
						</NavLink>
					)}
					{user ? (
						<button className='inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-bold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700' onClick={logout}>
							<LogOut className='h-4 w-4' /> <span className='hidden sm:inline'>Log Out</span>
						</button>
					) : (
						<>
							<NavLink to='/signup' className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400'>
								<UserPlus className='h-4 w-4' /> <span className='hidden sm:inline'>Sign Up</span>
							</NavLink>
							<NavLink to='/login' className='inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800'>
								<LogIn className='h-4 w-4' /> <span className='hidden sm:inline'>Login</span>
							</NavLink>
						</>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
