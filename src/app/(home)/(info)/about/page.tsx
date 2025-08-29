import { Button } from '@/components/ui/button'
import { ArrowRight, Bot, Box, ShieldCheck, Globe } from 'lucide-react'

export default function AboutPage() {
	const features = [
		{
			// Иконки теперь используют цвета, адаптированные для темы
			icon: <Bot className='h-8 w-8 text-zinc-900 dark:text-white' />,
			title: 'AI-Powered Generation',
			description:
				'Leverages cutting-edge Large Language Models to convert your natural language prompts into high-quality source code.',
		},
		{
			icon: <Box className='h-8 w-8 text-zinc-900 dark:text-white' />,
			title: 'Full-Stack Scaffolding',
			description:
				'Generates everything you need—from a beautiful frontend UI to robust backend logic and the database schema.',
		},
		{
			icon: <ShieldCheck className='h-8 w-8 text-zinc-900 dark:text-white' />,
			title: 'Secure & Isolated Builds',
			description:
				'All generated code is built and tested in a secure, sandboxed cloud environment, ensuring your projects are safe and reliable.',
		},
		{
			icon: <Globe className='h-8 w-8 text-zinc-900 dark:text-white' />,
			title: 'Project Dashboard',
			description:
				'Manage, view, and download all your generated applications from a simple, intuitive, and powerful interface.',
		},
	]

	return (
		// Основной контейнер теперь имеет фон и цвет текста для обеих тем
		<div className='bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 antialiased'>
			<div className='container mx-auto px-4 py-16 sm:py-24 lg:py-32'>
				{/* --- Hero Section --- */}
				<header className='text-center max-w-4xl mx-auto'>
					<div className='inline-block bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4'>
						About lummie.dev
					</div>
					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-200 dark:to-zinc-500'>
						Turn ideas into reality. Instantly.
					</h1>
					<p className='mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400'>
						lummie.dev is an AI-powered platform designed to automate software
						development. Describe your idea in plain English, and our AI will
						generate, build, and deliver a complete, ready-to-use web
						application.
					</p>
					<div className='mt-8 flex justify-center gap-4'>
						<Button className='bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-6 py-3 font-semibold'>
							Get Started <ArrowRight className='ml-2 h-4 w-4' />
						</Button>
						<Button className='bg-transparent border border-zinc-300 hover:bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300 px-6 py-3 font-semibold'>
							Contact Sales
						</Button>
					</div>
				</header>

				{/* --- Features Section --- */}
				<main className='mt-20 sm:mt-28'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{features.map(feature => (
							<div
								key={feature.title}
								className='bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-900'
							>
								<div className='bg-zinc-200 dark:bg-zinc-800/70 h-14 w-14 rounded-lg flex items-center justify-center mb-5'>
									{feature.icon}
								</div>
								<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
									{feature.title}
								</h3>
								<p className='mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed'>
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</main>

				{/* --- How It Works Section --- */}
				<section className='mt-20 sm:mt-28 text-center max-w-4xl mx-auto'>
					<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
						A Simple, Powerful Workflow
					</h2>
					<p className='mt-4 text-lg text-zinc-600 dark:text-zinc-400'>
						From a single prompt to a deployed application in minutes.
					</p>
					<div className='mt-12 flex flex-col md:flex-row items-center justify-center gap-8 text-left'>
						<div className='flex-1 p-6 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'>
							<div className='text-5xl font-bold text-zinc-300 dark:text-zinc-700'>
								1
							</div>
							<h3 className='mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
								Describe Your Vision
							</h3>
							<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
								Use natural language to detail the application you want to
								build. The more specific you are, the better the result.
							</p>
						</div>
						<div className='text-zinc-400 dark:text-zinc-600'>
							<ArrowRight size={32} className='hidden md:block' />
						</div>
						<div className='flex-1 p-6 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'>
							<div className='text-5xl font-bold text-zinc-300 dark:text-zinc-700'>
								2
							</div>
							<h3 className='mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
								AI Generation & Build
							</h3>
							<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
								Our platform orchestrates AI models to generate the full
								codebase and builds it in a secure cloud environment.
							</p>
						</div>
						<div className='text-zinc-400 dark:text-zinc-600'>
							<ArrowRight size={32} className='hidden md:block' />
						</div>
						<div className='flex-1 p-6 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg'>
							<div className='text-5xl font-bold text-zinc-300 dark:text-zinc-700'>
								3
							</div>
							<h3 className='mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100'>
								Download & Deploy
							</h3>
							<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
								Access your complete, production-ready application from your
								dashboard. Ready for deployment anywhere.
							</p>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
