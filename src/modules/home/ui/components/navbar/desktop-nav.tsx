'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, BookOpen, PenTool, Users, Sparkles } from 'lucide-react'

type NavItem = { href: string; label: string }

interface DesktopNavProps {
	pathname: string
	navItems: NavItem[]
}

export const DesktopNav = ({ pathname, navItems }: DesktopNavProps) => (
	<nav className='hidden md:flex items-center gap-8'>
		{navItems.map(item =>
			item.label === 'Resources' ? (
				<DropdownMenu key={item.href}>
					<DropdownMenuTrigger
						className={cn(
							'relative text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-md',
							pathname === item.href
								? 'text-primary font-semibold '
								: 'text-muted-foreground hover:text-primary'
						)}
					>
						{item.label}
						<ChevronDown className='h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180' />
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-64 mt-2 bg-background border border-border/50 rounded-xl shadow-2xl p-2'>
						<div className='p-2'>
							<div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
								Learn
							</div>
							<DropdownMenuItem asChild>
								<Link
									href='/resources/docs'
									className='flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors'
								>
									<BookOpen className='h-4 w-4' />
									Documentation
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									href='/resources/guides'
									className='flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors'
								>
									<PenTool className='h-4 w-4' />
									Guides & Tutorials
								</Link>
							</DropdownMenuItem>
						</div>
						<div className='p-2'>
							<div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
								Community
							</div>
							<DropdownMenuItem asChild>
								<Link
									href='/resources/blog'
									className='flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors'
								>
									<Sparkles className='h-4 w-4' />
									Blog
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link
									href='/resources/community'
									className='flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-md transition-colors'
								>
									<Users className='h-4 w-4' />
									Community Resources
								</Link>
							</DropdownMenuItem>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						'relative text-sm font-medium transition-colors px-3 py-2 rounded-md',
						pathname === item.href
							? 'text-primary font-semibold '
							: 'text-muted-foreground hover:text-primary'
					)}
				>
					{item.label}
					{pathname === item.href && (
						<motion.div
							className='absolute -bottom-1 left-0 right-0 h-0.5 bg-primary'
							layoutId='underline'
							transition={{ type: 'spring', stiffness: 300 }}
						/>
					)}
				</Link>
			)
		)}
	</nav>
)
