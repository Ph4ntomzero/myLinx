import { ArrowLeft, ShoppingBag, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import GiftCouponCard from "../components/GiftCouponCard";
import OrderSummary from "../components/OrderSummary";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import { useCartStore } from "../stores/useCartStore";

const CartPage = () => {
	const { cart } = useCartStore();

	return (
		<div className='page-shell'>
			<main className='relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10'>
				<Link to='/' className='inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-emerald-300'>
					<ArrowLeft className='h-4 w-4' /> Continue shopping
				</Link>
				<div className='mt-6 flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='section-kicker'><ShoppingBag className='h-4 w-4 text-emerald-400' /> Ready when you are</p>
						<h1 className='mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl'>Your <span className='text-emerald-400'>Cart</span></h1>
					</div>
					<p className='text-sm text-slate-400'>{cart.length} {cart.length === 1 ? "item" : "items"} selected</p>
				</div>

				<div className='mt-9 md:gap-7 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.7fr)]'>
					<motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
						{cart.length === 0 ? <EmptyCartUI /> : <div className='space-y-4'>{cart.map((item) => <CartItem key={item._id} item={item} />)}</div>}
						{cart.length > 0 && <PeopleAlsoBought />}
					</motion.div>
					{cart.length > 0 && (
						<motion.aside className='mt-7 space-y-5 lg:mt-0' initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
							<OrderSummary />
							<GiftCouponCard />
						</motion.aside>
					)}
				</div>
			</main>
		</div>
	);
};

const EmptyCartUI = () => (
	<motion.div className='premium-panel flex min-h-80 flex-col items-center justify-center rounded-2xl p-8 text-center' initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
		<div className='flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20'>
			<ShoppingCart className='h-9 w-9' />
		</div>
		<h2 className='mt-5 text-2xl font-black text-white'>Your cart is empty</h2>
		<p className='mt-2 max-w-sm text-slate-400'>Choose products from any category and they will appear here.</p>
		<Link className='mt-6 inline-flex min-h-11 items-center rounded-xl bg-emerald-500 px-5 font-bold text-slate-950 transition hover:bg-emerald-400' to='/category/SWEETS'>
			Browse products
		</Link>
	</motion.div>
);

export default CartPage;
