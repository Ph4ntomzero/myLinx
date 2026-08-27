import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			// add to cart
			addToCart(product);
		}
	};

	return (
		<div className='soft-card group flex w-full flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-[0_22px_55px_rgba(0,0,0,0.35)]'>
			<div className='relative m-3 flex h-56 overflow-hidden rounded-xl bg-slate-950'>
				<img className='h-full w-full object-cover transition duration-500 group-hover:scale-105' src={product.image} alt={product.name} />
				<div className='absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent' />
			</div>

			<div className='flex flex-1 flex-col px-5 pb-5'>
				<h5 className='text-lg font-bold tracking-tight text-white'>{product.name}</h5>
				<div className='mb-5 mt-3 flex items-center justify-between'>
					<p>
						<span className='text-xl font-black text-emerald-400'>R{product.price.toFixed(2)}</span>
					</p>
				</div>
				<button
					className='mt-auto flex min-h-11 items-center justify-center rounded-xl border-2 border-emerald-500 px-5 py-2.5 text-center text-sm font-bold text-slate-950 transition hover:bg-emerald-500 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-emerald-300/25'
					onClick={handleAddToCart}
				>
					<ShoppingCart size={22} className='mr-2' />
					Add to cart
				</button>
			</div>
		</div>
	);
};
export default ProductCard;
