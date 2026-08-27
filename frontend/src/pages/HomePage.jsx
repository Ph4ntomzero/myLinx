import { ArrowRight, CircleArrowRight, LockKeyhole, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import FeaturedProducts from "../components/FeaturedProducts";
import { useProductStore } from "../stores/useProductStore";

const benefits = [
	{ icon: Truck, title: "Fast & Reliable", text: "Local delivery" },
	{ icon: ShieldCheck, title: "Quality You Can", text: "Trust" },
	{ icon: LockKeyhole, title: "Secure Checkout", text: "& Payments" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, loading } = useProductStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='page-shell home-page'>
			<main className='relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-9 sm:px-8 sm:pt-14 lg:px-10 lg:pt-18'>
				<section className='grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16'>
					<div className='max-w-xl'>
						<div className='section-kicker'>
							<Sparkles className='h-4 w-4 text-emerald-400' />
							Your local shop.
						</div>
						<h1 className='mt-7 text-5xl font-black tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl'>
							Shop Every <span className='block text-emerald-400'>Category</span>
						</h1>
						<div className='section-rule' />
						<p className='mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg'>
							Discover everyday essentials, lifestyle favourites, and useful finds in one convenient place. There is something here for every need.
						</p>
						<div className='mt-8 flex flex-col gap-3 sm:flex-row'>
							<Link to='/category/SWEETS' className='inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 font-bold text-slate-950 shadow-[0_14px_35px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-400'>
								Shop Products <ArrowRight className='h-5 w-5' />
							</Link>
							<a href='#featured-products' className='inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-slate-600 bg-slate-950/30 px-6 font-bold text-white transition hover:border-emerald-400 hover:bg-emerald-500/10'>
								View Featured <CircleArrowRight className='h-5 w-5' />
							</a>
						</div>
						<div className='mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3'>
							{benefits.map(({ icon: Icon, title, text }) => (
								<div key={title} className='flex items-center gap-3'>
									<div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/15'>
										<Icon className='h-5 w-5' />
									</div>
									<p className='text-xs leading-5 text-slate-400'><span className='font-semibold text-slate-100'>{title}</span><br />{text}</p>
								</div>
							))}
						</div>
					</div>

					<Link to='/category/SWEETS' className='group relative mx-auto block w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-emerald-300/60 bg-slate-900 shadow-[0_0_45px_rgba(16,185,129,0.24)]'>
						<img src='/SWEETS.png' alt='Featured products' className='aspect-[0.9] w-full object-cover transition duration-700 group-hover:scale-105 sm:aspect-[1.08]' />
						<div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent' />
						<div className='absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-8'>
							<div>
								<p className='text-3xl font-black tracking-tight text-white'>SHOP BY CATEGORY</p>
								<p className='mt-1 text-sm text-slate-200'>Find something for every day</p>
							</div>
							<span className='flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/10 text-white transition group-hover:bg-emerald-400 group-hover:text-slate-950'>
								<ArrowRight className='h-5 w-5' />
							</span>
						</div>
					</Link>
				</section>

				<FeaturedProducts featuredProducts={products} isLoading={loading} />

				<section className='premium-panel mt-14 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4'>
					{[
						[Truck, "Free Local Delivery", "Delivered free to Unibell 1, 2 & 3 Gates."],
						[LockKeyhole, "Cash on Delivery", "Pay with cash when your order arrives."],
						[ShieldCheck, "Easy Checkout", "A simple, safe way to place your order."],
						[Sparkles, "Quality Products", "Useful finds for every need."],
					].map(([Icon, title, text]) => (
						<div key={title} className='bg-slate-950/20 p-6'>
							<Icon className='h-8 w-8 text-emerald-400' />
							<h2 className='mt-4 font-bold text-white'>{title}</h2>
							<p className='mt-2 text-sm leading-6 text-slate-400'>{text}</p>
						</div>
					))}
				</section>
			</main>
		</div>
	);
};

export default HomePage;
