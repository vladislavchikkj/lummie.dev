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
import { Moon, Sun, Monitor, User, LogOut, CreditCard } from 'lucide-react'
import { UserControl } from '@/components/user-control'
import { cn } from '@/lib/utils'
import type { UserResource } from '@clerk/types'
import { NotificationsPopover } from './notifications-popover'
import { BonusPopover } from './bonus-popover'

interface UserMenuMobileProps {
  theme: string
  setTheme: (theme: string) => void
}

const UserMenuMobile = ({ theme, setTheme }: UserMenuMobileProps) => {
  const itemClasses =
    'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent'

  return (
    <div className="flex w-full flex-col gap-1">
      <Link href="/profile" className={itemClasses}>
        <User className="h-4 w-4" />
        Profile
      </Link>
      <Link href="/profile/billing" className={itemClasses}>
        <CreditCard className="h-4 w-4" />
        Billing
      </Link>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme('light')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            theme === 'light' ? 'bg-accent' : 'hover:bg-accent'
          )}
          title="Light theme"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            theme === 'dark' ? 'bg-accent' : 'hover:bg-accent'
          )}
          title="Dark theme"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            theme === 'system' ? 'bg-accent' : 'hover:bg-accent'
          )}
          title="System theme"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
      <SignOutButton>
        <button className={cn(itemClasses, 'text-red-500 hover:bg-red-500/10')}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </SignOutButton>
    </div>
  )
}

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
    <div className="flex items-center gap-0.5">
      <NotificationsPopover />
      <BonusPopover />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent"
            aria-label="Open user menu"
          >
            <UserControl />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 w-60"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">My Account</p>
              <p className="text-muted-foreground text-xs leading-none">
                {user?.primaryEmailAddress?.toString()}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  theme === 'light' ? 'bg-accent' : 'hover:bg-accent'
                )}
                title="Light theme"
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  theme === 'dark' ? 'bg-accent' : 'hover:bg-accent'
                )}
                title="Dark theme"
              >
                <Moon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                  theme === 'system' ? 'bg-accent' : 'hover:bg-accent'
                )}
                title="System theme"
              >
                <Monitor className="h-4 w-4" />
              </button>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              signOut()
            }}
            className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
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
