const previewLines = ["w-24", "w-full", "w-4/5", "w-3/5"];

const LoadingSpinner = () => {
	return (
		<div className='loading-screen' role='status' aria-label='Preparing your storefront' aria-live='polite'>
			<div className='loading-orb loading-orb-left' aria-hidden='true' />
			<div className='loading-orb loading-orb-right' aria-hidden='true' />

			<div className='loading-preview mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10' aria-hidden='true'>
				<div className='flex items-center justify-between border-b border-emerald-100/10 pb-5'>
					<p className='text-2xl font-black tracking-tight text-white'>
						my<span className='text-emerald-400'>Linx</span>
					</p>
					<div className='flex gap-3'>
						<span className='loading-shimmer h-3 w-10 rounded-full' />
						<span className='loading-shimmer h-3 w-14 rounded-full' />
						<span className='loading-shimmer h-9 w-20 rounded-lg' />
					</div>
				</div>

				<main className='mt-12 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16'>
					<div className='max-w-xl'>
						<span className='loading-shimmer mb-7 block h-8 w-36 rounded-full' />
						<div className='space-y-4'>
							<span className='loading-shimmer block h-12 w-full max-w-md rounded-xl sm:h-16' />
							<span className='loading-shimmer block h-12 w-3/4 rounded-xl sm:h-16' />
							<div className='h-px w-36 bg-linear-to-r from-emerald-400 to-transparent' />
							<div className='space-y-3 pt-3'>
								{previewLines.map((width) => <span key={width} className={`loading-shimmer block h-3 ${width} rounded-full`} />)}
							</div>
							<div className='flex gap-3 pt-6'>
								<span className='loading-shimmer h-12 w-36 rounded-xl' />
								<span className='loading-shimmer h-12 w-32 rounded-xl' />
							</div>
						</div>
					</div>

					<div className='loading-product-card relative mx-auto aspect-[1.08] w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-emerald-300/20'>
						<div className='loading-product-shape loading-product-shape-one' />
						<div className='loading-product-shape loading-product-shape-two' />
						<div className='absolute inset-x-0 bottom-0 space-y-3 p-6 sm:p-8'>
							<span className='loading-shimmer block h-8 w-3/4 rounded-lg' />
							<span className='loading-shimmer block h-3 w-1/2 rounded-full' />
						</div>
					</div>
				</main>

				<div className='mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4'>
					{[1, 2, 3, 4].map((item) => (
						<div key={item} className='loading-feature rounded-2xl p-5'>
							<span className='loading-shimmer block h-8 w-8 rounded-full' />
							<span className='loading-shimmer mt-5 block h-3 w-3/4 rounded-full' />
							<span className='loading-shimmer mt-3 block h-3 w-full rounded-full' />
						</div>
					))}
				</div>
			</div>

			<div className='loading-status' aria-hidden='true'>
				<div className='loading-mark'>
					<div className='loading-ring' />
					<div className='loading-core' />
				</div>
				<p className='mt-5 text-sm font-bold tracking-wide text-emerald-50'>Preparing your storefront</p>
				<p className='mt-1 text-xs text-emerald-100/60'>A fresh selection is on its way.</p>
			</div>
		</div>
	);
};

export default LoadingSpinner;
