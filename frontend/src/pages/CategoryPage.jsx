import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useProductStore } from "../stores/useProductStore";

const CategoryPage = () => {
	const { fetchProductsByCategory, products, loading } = useProductStore();
	const { category } = useParams();
	const title = category.charAt(0).toUpperCase() + category.slice(1);

	useEffect(() => {
		fetchProductsByCategory(category);
	}, [fetchProductsByCategory, category]);

	return (
		<div className='page-shell'>
			<main className='relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10'>
				<Link to='/' className='inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-emerald-300'>
					<ArrowLeft className='h-4 w-4' /> Back to home
				</Link>
				<div className='mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end'>
					<div>
						<p className='section-kicker'><Sparkles className='h-4 w-4 text-emerald-400' /> Shop by category</p>
						<h1 className='mt-5 text-5xl font-black tracking-tight text-white sm:text-6xl'>
							Explore <span className='text-emerald-400'>{title}</span>
						</h1>
					</div>
					<p className='max-w-sm text-sm leading-6 text-slate-400'>Browse products in this category and add what you need for fast local delivery.</p>
				</div>

				<motion.div
					className='mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
					initial={{ opacity: 0, y: 18 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45 }}
				>
					{loading ? Array.from({ length: 4 }, (_, index) => (
						<div key={index} className='h-[360px] animate-pulse rounded-2xl bg-slate-800/60' />
					)) : products.length === 0 ? (
						<div className='premium-panel col-span-full rounded-2xl p-10 text-center'>
							<p className='text-xl font-bold text-white'>No products found yet.</p>
							<p className='mt-2 text-slate-400'>Please check back soon for new products.</p>
						</div>
					) : (
						products.map((product) => <ProductCard key={product._id} product={product} />)
					)}
				</motion.div>
			</main>
		</div>
	);
};

export default CategoryPage;
