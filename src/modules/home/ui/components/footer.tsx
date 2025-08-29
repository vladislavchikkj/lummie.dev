'use client'

import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

const footerLinks = [
	{ href: '/about', label: 'About Us' },
	{ href: '/contact', label: 'Contact' },
	{ href: '/privacy', label: 'Privacy Policy' },
	{ href: '/terms', label: 'Terms of Service' },
]

const socialLinks = [
	{
		href: 'https://github.com/vladislavchikkj/lummie.dev',
		label: 'GitHub',
		icon: Github,
	},
	{
		href: 'https://twitter.com',
		label: 'Twitter',
		icon: Twitter,
	},
	{
		href: 'https://www.linkedin.com/company/lcloud-inc/?viewAsMember=true',
		label: 'LinkedIn',
		icon: Linkedin,
	},
]

export const Footer = () => {
	return (
		<footer className='border-t bg-background'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='py-12 flex flex-col lg:flex-row justify-between items-start gap-8'>
					<div className='max-w-sm'>
						<Link href='/' className='flex items-center gap-2 mb-4'>
							<Logo width={28} height={28} />
							<span className='font-bold text-lg text-foreground'>Lummie</span>
						</Link>
						<p className='text-muted-foreground text-sm'>
							Your smart assistant for creating amazing content. Boost your
							productivity with AI.
						</p>
					</div>

					<nav
						className='flex flex-wrap gap-x-8 gap-y-4'
						aria-label='Footer Navigation'
					>
						{footerLinks.map(link => (
							<Link
								key={link.href}
								href={link.href}
								className='text-sm text-muted-foreground hover:text-foreground transition-colors'
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>

				<div className='border-t py-6 flex flex-col sm:flex-row items-center justify-between gap-4'>
					<p className='text-sm text-muted-foreground'>
						&copy; {new Date().getFullYear()} Lummie. All Rights Reserved.
					</p>
					<div className='flex items-center gap-4'>
						{socialLinks.map(social => (
							<Link
								key={social.label}
								href={social.href}
								target='_blank'
								rel='noopener noreferrer'
								aria-label={social.label}
								className='text-muted-foreground hover:text-foreground transition-colors'
							>
								<social.icon className='h-5 w-5' />
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	)
}
