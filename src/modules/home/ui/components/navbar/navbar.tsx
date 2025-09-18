'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { DesktopNav } from './desktop-nav'
import { AuthControls } from './auth-controls'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { useSidebar } from '@/components/ui/sidebar'
import Logo from '@/components/ui/logo'
import { ArrowDown, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
]
const AuthSkeleton = () => {
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-8" />
    </div>
  )
}

interface NavbarProps {
  showDesktopNav?: boolean
  applyScrollStyles?: boolean
}

export const Navbar = ({
  showDesktopNav = true,
  applyScrollStyles = true,
}: NavbarProps) => {
  const isScrolled = useScroll()
  const pathname = usePathname()
  const { isLoaded } = useAuth()

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-transparent px-4 py-2 transition-all duration-300',
        isScrolled &&
          applyScrollStyles &&
          'bg-background/95 border-border shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1 transition-all hover:opacity-80"
          >
            <Logo width={24} height={24} />
          </Link>
          {showDesktopNav && (
            <DesktopNav pathname={pathname} navItems={navItems} />
          )}
        </div>
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
