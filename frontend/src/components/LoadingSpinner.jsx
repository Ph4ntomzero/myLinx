const LoadingSpinner = () => {
	return (
		<div className='flex min-h-screen items-center justify-center bg-gray-900' role='status'>
			<div className='relative h-20 w-20'>
				<div className='h-20 w-20 rounded-full border-2 border-emerald-200' />
				<div className='absolute inset-0 h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-emerald-500' />
			</div>
			<span className='sr-only'>Loading</span>
		</div>
	);
};

export default LoadingSpinner;
