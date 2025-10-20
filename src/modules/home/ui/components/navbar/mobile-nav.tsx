import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import {
  SheetContent,
  SheetClose,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Bell, X } from 'lucide-react'
import { LogoLink } from './logo-link'
import { AuthControls } from './auth-controls'
import { UserMenu } from './user-menu'
import { A11Y_OUTLINE_CLASSES } from '@/components/constants'

type NavItem = {
  href: string
  label: string
}

interface MobileNavProps {
  pathname: string
  navItems: NavItem[]
}

export const MobileNav = ({ pathname, navItems }: MobileNavProps) => (
  <>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn('rounded-lg lg:hidden', A11Y_OUTLINE_CLASSES)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="bg-background flex w-full max-w-xs flex-col p-0"
    >
      <SheetHeader className="border-b p-4">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation menu and user controls
        </SheetDescription>
        <div className="flex items-center justify-between">
          <LogoLink />
        </div>
      </SheetHeader>

      <nav className="flex-1 p-4">
        <ul className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <SheetClose asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t p-4">
        <SignedOut>
          <AuthControls mobile />
        </SignedOut>
        <SignedIn>
          <div className="flex items-start justify-between">
            <UserMenu mobile />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </SignedIn>
      </div>
    </SheetContent>
  </>
)
