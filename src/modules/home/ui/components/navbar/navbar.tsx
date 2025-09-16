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
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

const navItems = [
  { href: 'https://discord.gg/VevBCcQy23', label: 'Community' },
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/resources', label: 'Resources' },
  { href: '/pricing', label: 'Pricing' },
]

// Skeleton component for auth controls
const AuthSkeleton = () => {
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-8" />
    </div>
  )
}

export const Navbar = () => {
  const isScrolled = useScroll()
  const pathname = usePathname()
  const { isLoaded } = useAuth()
  const { toggleSidebar } = useSidebar()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-transparent px-4 py-2 transition-all duration-300',
        isScrolled &&
          'bg-background/95 border-border shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <div onClick={toggleSidebar}>
          <LogoLink />
        </div>
        <DesktopNav pathname={pathname} navItems={navItems} />
        <div className="hidden min-w-[100px] items-center gap-3 md:flex">
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
        <div className="md:hidden">
          <Sheet>
            <MobileNav pathname={pathname} navItems={navItems} />
          </Sheet>
        </div>
      </div>
    </header>
  )
}
