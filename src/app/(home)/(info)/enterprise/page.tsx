import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/app/constants'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import { Button } from '@/components/ui/button'
import {
	ShieldCheck,
	KeyRound,
	Headset,
	Scaling,
	BarChart3,
	ClipboardCheck,
	ArrowRight,
	Server,
	Code,
	MessageCircle,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	metadataBase: new URL(APP_URL),

	title: 'Enterprise',
	description: APP_DESCRIPTION,

	openGraph: {
		title: APP_NAME,
		description: APP_DESCRIPTION,
		url: APP_URL,
		siteName: APP_NAME,
		images: [
			{
				url: '/og-image.png',
				width: 1200,
				height: 630,
				alt: `Preview image for ${APP_NAME}`,
			},
		],
		locale: 'en_US',
		type: 'website',
	},

	twitter: {
		card: 'summary_large_image',
		title: APP_NAME,
		description: APP_DESCRIPTION,
		images: ['/og-image.png'],
	},
}

const enterpriseFeatures = [
	{
		icon: <ShieldCheck className='h-8 w-8 text-primary' />,
		title: 'Enterprise-Grade Security',
		description:
			'Robust security controls and compliance measures to protect your data.',
	},
	{
		icon: <KeyRound className='h-8 w-8 text-primary' />,
		title: 'SAML SSO & SCIM',
		description:
			'Centralized access management with single sign-on and automated user provisioning.',
	},
	{
		icon: <Headset className='h-8 w-8 text-primary' />,
		title: '24/7 Priority Support',
		description: 'Dedicated support from our experts, available anytime.',
	},
	{
		icon: <Scaling className='h-8 w-8 text-primary' />,
		title: 'Scalable Infrastructure',
		description: 'Performance that grows with your team, no matter the size.',
	},
	{
		icon: <BarChart3 className='h-8 w-8 text-primary' />,
		title: 'Advanced Analytics',
		description: 'Deep insights into your team’s workflows and performance.',
	},
	{
		icon: <ClipboardCheck className='h-8 w-8 text-primary' />,
		title: 'Compliance & Audit',
		description: 'Audit logs and tools to meet industry standards.',
	},
	{
		icon: <Server className='h-8 w-8 text-primary' />,
		title: 'Uptime Guarantee',
		description: 'Financially backed SLA for maximum service availability.',
	},
	{
		icon: <Code className='h-8 w-8 text-primary' />,
		title: 'AI-Powered App Generation',
		description:
			'Generate custom applications effortlessly using advanced AI tools.',
	},
	{
		icon: <MessageCircle className='h-8 w-8 text-primary' />,
		title: 'Intelligent Chatbot',
		description: 'Enhance user engagement with a smart, AI-driven chatbot.',
	},
]

const EnterprisePage = () => {
	return (
		<div className='w-full relative'>
			{/* Hero Section */}
			<section className='relative text-center py-24 md:py-32 lg:py-40 bg-gradient-to-b from-background to-neutral-50 dark:to-neutral-900'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#a78bfa22,transparent)] -z-10' />
				<div className='container max-w-5xl mx-auto px-4 z-10'>
					<div className='z-5'>
						<BackgroundRippleEffect />
					</div>
					<h1 className='relative z-10 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-600'>
						Lummie for Enterprises
					</h1>
					<p className='relative z-10 mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto'>
						Build and scale applications effortlessly with Lummie’s AI-powered
						app generation and intelligent chatbot solutions.
					</p>
					<div className='relative z-10 mt-8 flex justify-center gap-4'>
						<Button
							size='lg'
							className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6'
							asChild
						>
							<Link href='/contact/sales'>
								Contact Sales
								<ArrowRight className='ml-2 h-5 w-5' />
							</Link>
						</Button>
						<Button
							size='lg'
							variant='outline'
							className='rounded-full px-6 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
							asChild
						>
							<Link href='/learn-more'>Learn More</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 md:py-28 bg-neutral-50 dark:bg-neutral-900'>
				<div className='container mx-auto px-4'>
					<div className='text-center max-w-3xl mx-auto'>
						<h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
							A Platform Built for Innovation
						</h2>
						<p className='mt-4 text-lg text-muted-foreground'>
							Lummie Enterprise empowers teams with AI-driven tools for app
							development and intelligent chatbot solutions.
						</p>
					</div>

					<div className='mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{enterpriseFeatures.map(feature => (
							<div
								key={feature.title}
								className='p-6 bg-background rounded-2xl border border-neutral-200 dark:border-neutral-700 transition-all hover:shadow-xl hover:border-primary/50'
							>
								<div className='mb-4'>{feature.icon}</div>
								<h3 className='text-lg font-semibold'>{feature.title}</h3>
								<p className='mt-2 text-sm text-muted-foreground'>
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className='py-20 md:py-28 bg-gradient-to-b from-background to-neutral-50 dark:to-neutral-900'>
				<div className='container text-center max-w-3xl mx-auto px-4'>
					<h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
						Ready to Transform Your Workflow?
					</h2>
					<p className='mt-4 text-lg text-muted-foreground'>
						Connect with our team to create a tailored plan for your enterprise.
					</p>
					<div className='mt-8'>
						<Button
							size='lg'
							className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6'
							asChild
						>
							<Link href='/contact/sales'>
								Start the Conversation
								<ArrowRight className='ml-2 h-5 w-5' />
							</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	)
}

export default EnterprisePage
