export default function Base(props: { children: React.ReactNode }) {
	return (
		<div className='bg-base-100 text-base-content min-h-screen p-2'>
			<div className='mx-auto container'>{props.children}</div>
		</div>
	);
}
