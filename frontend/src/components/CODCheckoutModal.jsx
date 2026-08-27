import { useState } from "react";
import { MapPin, Phone, Truck, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useOrderStore } from "../stores/useOrderStore";

const DELIVERY_LOCATIONS = ["Unibell 1 Gate", "Unibell 2 Gate", "Unibell 3 Gate"];
const PHONE_PATTERN = /^(?:0\d{9}|\+27\d{9})$/;

const createCheckoutId = () =>
	globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const CODCheckoutModal = ({ onClose }) => {
	const navigate = useNavigate();
	const { coupon, isCouponApplied, clearCart } = useCartStore();
	const { createCODOrder, loading } = useOrderStore();
	const [phoneNumber, setPhoneNumber] = useState("");
	const [deliveryLocation, setDeliveryLocation] = useState("");
	const [orderNote, setOrderNote] = useState("");
	const [checkoutId] = useState(createCheckoutId);
	const [orderPlaced, setOrderPlaced] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const normalizedPhoneNumber = phoneNumber.replace(/[\s()-]/g, "");

		if (!PHONE_PATTERN.test(normalizedPhoneNumber)) {
			toast.error("Enter a valid South African phone number");
			return;
		}
		if (!DELIVERY_LOCATIONS.includes(deliveryLocation)) {
			toast.error("Select one of the available delivery gates");
			return;
		}

		const order = await createCODOrder({
			phoneNumber: normalizedPhoneNumber,
			deliveryLocation,
			orderNote,
			checkoutId,
			couponCode: isCouponApplied ? coupon?.code : undefined,
		});

		if (!order) return;

		setOrderPlaced(true);
		await clearCart();
		window.setTimeout(() => {
			navigate(`/order-success/${order._id}`, { state: { order } });
		}, 450);
	};

	return (
		<div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4'>
			<motion.div
				className='relative w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-2xl'
				initial={{ opacity: 0, scale: 0.95, y: 16 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				<button
					type='button'
					onClick={onClose}
					disabled={loading || orderPlaced}
					className='absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50'
					aria-label='Close checkout form'
				>
					<X className='h-5 w-5' />
				</button>

				<div className='mb-6 flex items-center gap-3 pr-8'>
					<div className='rounded-full bg-emerald-500/15 p-3'>
						<Truck className='h-6 w-6 text-emerald-400' />
					</div>
					<div>
						<h2 className='text-xl font-bold text-white'>Cash on Delivery</h2>
						<p className='text-sm text-gray-400'>Free delivery to Unibell 1, 2 and 3 Gates.</p>
					</div>
				</div>

				<form onSubmit={handleSubmit} className='space-y-5' noValidate>
					<div>
						<label htmlFor='phoneNumber' className='mb-1 block text-sm font-medium text-gray-300'>
							Phone Number
						</label>
						<div className='relative'>
							<Phone className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
							<input
								id='phoneNumber'
								value={phoneNumber}
								onChange={(event) => setPhoneNumber(event.target.value)}
								placeholder='0821234567 or +27821234567'
								className='w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
							/>
						</div>
					</div>

					<div>
						<label htmlFor='deliveryLocation' className='mb-1 block text-sm font-medium text-gray-300'>
							Delivery Location
						</label>
						<div className='relative'>
							<MapPin className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
							<select
								id='deliveryLocation'
								value={deliveryLocation}
								onChange={(event) => setDeliveryLocation(event.target.value)}
								className='w-full appearance-none rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 pr-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
							>
								<option value=''>Select delivery location</option>
								{DELIVERY_LOCATIONS.map((location) => (
									<option key={location} value={location}>{location}</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label htmlFor='orderNote' className='mb-1 block text-sm font-medium text-gray-300'>
							Order Note <span className='text-gray-500'>(optional)</span>
						</label>
						<textarea
							id='orderNote'
							value={orderNote}
							onChange={(event) => setOrderNote(event.target.value)}
							maxLength={500}
							rows={3}
							placeholder="e.g. I'll meet you at the main entrance"
							className='w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
						/>
					</div>

					<button
						type='submit'
						disabled={loading || orderPlaced}
						className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
					>
						{orderPlaced ? "Order Placed!" : loading ? "Placing Order..." : "Place Order - Cash on Delivery"}
					</button>
				</form>
			</motion.div>
		</div>
	);
};

export default CODCheckoutModal;
