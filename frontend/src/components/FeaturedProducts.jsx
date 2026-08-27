import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ featuredProducts = [], isLoading }) => {
	const products = featuredProducts.slice(0, 4);

	return (
		<section id='featured-products' className='scroll-mt-28 pt-20'>
			<div className='text-center'>
				<p className='section-kicker'><Sparkles className='h-4 w-4 text-emerald-400' /> Fresh arrivals</p>
				<h2 className='mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl'>
					Featured <span className='text-emerald-400'>Products</span>
				</h2>
				<div className='mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-emerald-400 to-transparent' />
			</div>

			{isLoading ? (
				<div className='mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{Array.from({ length: 4 }, (_, index) => <div key={index} className='h-[360px] animate-pulse rounded-2xl bg-slate-800/60' />)}
				</div>
			) : products.length > 0 ? (
				<div className='mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{products.map((product) => <ProductCard key={product._id} product={product} />)}
				</div>
			) : (
				<div className='premium-panel mx-auto mt-8 max-w-lg rounded-2xl p-7 text-center'>
					<p className='text-lg font-semibold text-white'>New products are coming soon.</p>
					<p className='mt-2 text-sm text-slate-400'>Check back soon for new products across every category.</p>
				</div>
			)}

			<Link to='/category/SWEETS' className='mx-auto mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border-2 border-emerald-500 px-6 font-bold text-slate-950 transition hover:bg-emerald-500 hover:text-slate-950'>
				View All Products <ArrowRight className='h-5 w-5' />
			</Link>
		</section>
	);
};

export default FeaturedProducts;
