import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
	return (
		<div className='flex flex-col min-h-screen items-center justify-center text-center px-4 bg-background text-foreground'>
			<main className='flex flex-col items-center justify-center flex-1 space-y-8'>
				<div className='space-y-4'>
					<h1 className='text-8xl md:text-9xl font-bold tracking-tighter'>
						404
					</h1>
					<h2 className='text-2xl md:text-3xl font-semibold tracking-tight'>
						Page Not Found
					</h2>
					<p className='max-w-md text-base md:text-lg text-muted-foreground'>
						{/* New Joke */}
						Looks like this page went on a vacation. We&apos;ve sent a search
						party of ones and zeros to bring it back.
					</p>
				</div>

				<Button asChild size='lg' variant='outline'>
					<Link href='/'>Return to Home</Link>
				</Button>
			</main>

			<footer className='py-8 text-sm text-muted-foreground'>
				<a
					href='https://lummie.dev'
					target='_blank'
					rel='noopener noreferrer'
					className='transition-colors hover:text-foreground'
				>
					lummie.dev
				</a>
			</footer>
		</div>
	)
}
