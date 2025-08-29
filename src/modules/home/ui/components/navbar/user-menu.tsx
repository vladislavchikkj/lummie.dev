import Link from 'next/link'
import { useClerk, useUser, SignOutButton } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
	DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import {
	Moon,
	Sun,
	User,
	Settings,
	LogOut,
	Gift,
	MessageSquareDot,
} from 'lucide-react'
import { UserControl } from '@/components/user-control'
import { cn } from '@/lib/utils'

interface UserMenuMobileProps {
	theme: string
	setTheme: (theme: string) => void
}

const UserMenuMobile = ({ theme, setTheme }: UserMenuMobileProps) => {
	const itemClasses =
		'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'

	return (
		<div className='flex flex-col gap-1 w-full'>
			<Link href='/profile' className={itemClasses}>
				<User className='h-4 w-4' />
				Profile
			</Link>
			<Link href='/settings' className={itemClasses}>
				<Settings className='h-4 w-4' />
				Settings
			</Link>
			<button
				onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				className={itemClasses}
			>
				{theme === 'dark' ? (
					<Sun className='h-4 w-4' />
				) : (
					<Moon className='h-4 w-4' />
				)}
				<span>Toggle Theme</span>
			</button>
			<SignOutButton>
				<button className={cn(itemClasses, 'text-red-500 hover:bg-red-500/10')}>
					<LogOut className='h-4 w-4' />
					Sign Out
				</button>
			</SignOutButton>
		</div>
	)
}

import type { UserResource } from '@clerk/types'

const UserMenuDesktop = ({
	user,
	theme,
	setTheme,
	signOut,
}: {
	user: UserResource | null | undefined
	theme: string
	setTheme: (theme: string) => void
	signOut: () => void
}) => {
	return (
		<div className='flex items-center gap-0.5'>
			<Button
				variant='ghost'
				size='icon'
				className='rounded-full hover:bg-accent relative'
				aria-label='Notifications'
			>
				<Gift className='h-5 w-5' />
			</Button>
			<Button
				variant='ghost'
				size='icon'
				className='rounded-full hover:bg-accent relative'
				aria-label='Notifications'
			>
				<MessageSquareDot className='h-5 w-5' />
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='hover:bg-accent'
						aria-label='Open user menu'
					>
						<UserControl />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='w-60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2'
				>
					<DropdownMenuLabel className='font-normal'>
						<div className='flex flex-col space-y-1'>
							<p className='text-sm font-medium leading-none'>My Account</p>
							<p className='text-xs leading-none text-muted-foreground'>
								{user?.primaryEmailAddress?.toString()}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link href='/profile'>
								<User className='mr-2 h-4 w-4' />
								<span>Profile</span>
								<DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href='/settings'>
								<Settings className='mr-2 h-4 w-4' />
								<span>Settings</span>
								<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
					>
						{theme === 'dark' ? (
							<Sun className='mr-2 h-4 w-4' />
						) : (
							<Moon className='mr-2 h-4 w-4' />
						)}
						<span>Toggle Theme</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={e => {
							e.preventDefault()
							signOut()
						}}
						className='text-red-500 focus:bg-red-500/10 focus:text-red-500'
					>
						<LogOut className='mr-2 h-4 w-4' />
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

interface UserMenuProps {
	mobile?: boolean
}

export const UserMenu = ({ mobile }: UserMenuProps) => {
	const { setTheme, theme } = useTheme()
	const { user } = useUser()
	const { signOut } = useClerk()

	if (mobile) {
		return <UserMenuMobile theme={theme ?? 'light'} setTheme={setTheme} />
	}

	return (
		<UserMenuDesktop
			user={user}
			theme={theme ?? 'light'}
			setTheme={setTheme}
			signOut={signOut}
		/>
	)
}
