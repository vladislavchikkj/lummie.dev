import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'

interface Props {
	children: React.ReactNode
}

const Layout = ({ children }: Props) => {
	return (
		<main className='flex flex-col min-h-screen'>
			<div className='relative flex min-h-screen w-full flex-col items-start justify-start overflow-auto'>
				<BackgroundRippleEffect />
				<div className='mt-40 w-full'>{children}</div>
			</div>
		</main>
	)
}

export default Layout
