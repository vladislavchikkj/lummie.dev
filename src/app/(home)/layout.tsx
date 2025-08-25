import { Navbar } from '@/modules/home/ui/components/navbar'

interface Props {
	children: React.ReactNode
}

const Layout = ({ children }: Props) => {
	return (
		<main className='flex flex-col min-h-screen'>
			<Navbar />
			<div className='relative flex min-h-screen w-full flex-col items-start justify-center overflow-auto'>
				<div className='w-full'>{children}</div>
			</div>
		</main>
	)
}

export default Layout
