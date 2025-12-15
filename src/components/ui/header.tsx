'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { Skeleton } from '@/components/ui/skeleton'
import { AuthControls } from '@/modules/home/ui/components/navbar/auth-controls'
import { UserMenu } from '@/modules/home/ui/components/navbar/user-menu'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CrownIcon, Menu } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { formatDuration, intervalToDuration } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { UsagePopover } from '@/modules/home/ui/components/navbar/usage-popover'
import { useSidebar } from '@/components/ui/sidebar'

const navItems = [
  { href: '/enterprise', label: 'Enterprise' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
]

const AuthSkeletonDesktop = () => {
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  )
}

const AuthSkeletonMobile = () => {
  return (
    <div className="flex items-center">
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  )
}

interface HeaderProps {
  showDesktopNav?: boolean
  applyScrollStyles?: boolean
  leftContent?: React.ReactNode
  mobilePathname?: string
}

export const Header = ({
  showDesktopNav = true,
  applyScrollStyles = true,
  leftContent,
  mobilePathname,
}: HeaderProps) => {
  const isScrolled = useScroll()
  const pathname = usePathname()
  const { isLoaded, has, userId } = useAuth()
  const trpc = useTRPC()
  const { toggleSidebar } = useSidebar()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: usage, isLoading: isUsageLoading } = useQuery({
    ...trpc.usage.status.queryOptions(),
    enabled: !!userId,
  })

  const hasProAccess = has?.({ plan: 'pro' })
  const points = usage?.remainingPoints ?? 0
  const msBeforeNext = usage?.msBeforeNext ?? 0
  const hasNoCredits = points <= 0

  const resetTime = useMemo(() => {
    if (!msBeforeNext) return '...'
    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + msBeforeNext),
        }),
        { format: ['days', 'hours'] }
      )
    } catch (error) {
      console.error('Error formatting duration:', error)
      return '...'
    }
  }, [msBeforeNext])

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex h-14 min-h-14 items-center border-b border-transparent bg-transparent px-4 py-2 transition-all duration-300',
        isScrolled &&
          applyScrollStyles &&
          'bg-background/95 border-border shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex h-full w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {leftContent || (
            <>
              {/* Desktop: Link to home */}
              <Link
                href="/"
                scroll={false}
                className="hidden cursor-pointer items-center gap-1 transition-all hover:opacity-80 md:flex"
              >
                <Logo width={24} height={24} />
              </Link>
              {/* Mobile: Toggle sidebar */}
              <div
                onClick={toggleSidebar}
                className="flex cursor-pointer items-center gap-1 transition-all hover:opacity-80 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </div>
            </>
          )}
          {showDesktopNav && (
            <div className="hidden md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  className={cn(
                    'hover:text-foreground px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="hidden min-w-[100px] items-center gap-1 md:flex">
          {!isMounted || !isLoaded ? (
            <AuthSkeletonDesktop />
          ) : (
            <>
              <SignedOut>
                <AuthControls />
              </SignedOut>
              <SignedIn>
                {isUsageLoading ? (
                  <Skeleton className="h-8 w-20 rounded-md" />
                ) : usage && hasNoCredits && !hasProAccess ? (
                  <Button asChild size="sm" className="h-8">
                    <Link href="/pricing" scroll={false}>
                      <CrownIcon className="mr-2 h-4 w-4" />
                      Upgrade
                    </Link>
                  </Button>
                ) : usage ? (
                  <UsagePopover
                    points={points}
                    hasProAccess={hasProAccess}
                    resetTime={resetTime}
                  />
                ) : null}
                <UserMenu />
              </SignedIn>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 md:hidden">
          {!isMounted || !isLoaded ? (
            <AuthSkeletonMobile />
          ) : (
            <>
              <SignedOut>
                <AuthControls />
              </SignedOut>
              <SignedIn>
                {/* UsagePopover скрыт на мобильных, поэтому не показываем скелетон и сам компонент */}
                <UserMenu />
              </SignedIn>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
