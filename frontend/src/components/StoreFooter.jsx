import { Headphones, Mail, MapPin, ShieldCheck, Truck } from "lucide-react";

const StoreFooter = () => (
	<footer className='relative z-10 border-t border-slate-800/90 bg-[#030b10]/90'>
		<div className='mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.15fr_1fr] lg:px-10'>
			<div>
				<p className='text-xl font-bold tracking-tight text-white'>my<span className='text-emerald-400'>Linx</span></p>
				<p className='mt-4 max-w-md text-sm leading-6 text-slate-400'>
					Your online shop for everyday essentials, simple ordering, and reliable local delivery.
				</p>
				<div className='mt-5 flex items-center gap-2 text-sm text-emerald-300'>
					<ShieldCheck className='h-4 w-4' /> Secure ordering with Cash on Delivery
				</div>
			</div>
			<div className='grid gap-4 text-sm text-slate-300 sm:grid-cols-2'>
				<div className='flex gap-3'>
					<Truck className='mt-0.5 h-5 w-5 shrink-0 text-emerald-400' />
					<span>Free delivery to Unibell 1, 2 and 3 Gates.</span>
				</div>
				<div className='flex gap-3'>
					<MapPin className='mt-0.5 h-5 w-5 shrink-0 text-emerald-400' />
					<span>Fast, local delivery straight to your selected gate.</span>
				</div>
				<div className='flex gap-3'>
					<Headphones className='mt-0.5 h-5 w-5 shrink-0 text-emerald-400' />
					<span>Easy ordering.</span>
				</div>
				<div className='flex gap-3'>
					<Mail className='mt-0.5 h-5 w-5 shrink-0 text-emerald-400' />
					<span>Order updates are sent after checkout.</span>
				</div>
			</div>
		</div>
		<div className='border-t border-slate-800 px-4 py-5 text-center text-sm text-slate-500'>
			© {new Date().getFullYear()} myLinx. Made for everyday moments.
		</div>
	</footer>
);

export default StoreFooter;
