'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { LogoLink } from './logo-link'
import { DesktopNav } from './desktop-nav'
import { AuthControls } from './auth-controls'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'

const navItems = [
	{ href: 'https://discord.gg/VevBCcQy23', label: 'Community' },
	{ href: '/enterprise', label: 'Enterprise' },
	{ href: '/resources', label: 'Resources' },
	{ href: '/pricing', label: 'Pricing' },
]

// Skeleton component for auth controls
const AuthSkeleton = () => {
	return (
		<div className='flex items-center gap-2 min-w-[100px]'>
			<Skeleton className='h-8 w-8 rounded-full' />
			<Skeleton className='h-8 w-8 rounded-full' />
			<Skeleton className='h-8 w-8' />
		</div>
	)
}

export const Navbar = () => {
	const isScrolled = useScroll()
	const pathname = usePathname()
	const { isLoaded } = useAuth()

	return (
		<header
			className={cn(
				'p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
				isScrolled &&
					'bg-background/95 border-border backdrop-blur-xl shadow-sm'
			)}
		>
			<div className='max-w-7xl mx-auto w-full flex justify-between items-center'>
				<LogoLink />
				<DesktopNav pathname={pathname} navItems={navItems} />
				<div className='hidden md:flex items-center gap-3 min-w-[100px]'>
					{!isLoaded ? (
						<AuthSkeleton />
					) : (
						<>
							<SignedOut>
								<AuthControls />
							</SignedOut>
							<SignedIn>
								<UserMenu />
							</SignedIn>
						</>
					)}
				</div>
				<div className='md:hidden'>
					<Sheet>
						<MobileNav pathname={pathname} navItems={navItems} />
					</Sheet>
				</div>
			</div>
		</header>
	)
}
