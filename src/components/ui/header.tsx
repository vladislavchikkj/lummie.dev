'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { AuthControls } from '@/modules/home/ui/components/navbar/auth-controls'
import { UserMenu } from '@/modules/home/ui/components/navbar/user-menu'
import { MobileNav } from '@/modules/home/ui/components/navbar/mobile-nav'
import Logo from '@/components/ui/logo'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CrownIcon } from 'lucide-react'
import { useMemo } from 'react'
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

const AuthSkeleton = () => {
  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-8 w-8" />
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

  const { data: usage, isLoading: isUsageLoading } = useQuery({
    ...trpc.usage.status.queryOptions(),
    enabled: !!userId, // Выполнять запрос только если пользователь авторизован
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
        'fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-transparent px-4 py-2 transition-all duration-300',
        isScrolled &&
          applyScrollStyles &&
          'bg-background/95 border-border shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {leftContent || (
            <div
              onClick={toggleSidebar}
              className="flex cursor-pointer items-center gap-1 transition-all hover:opacity-80"
            >
              <Logo width={24} height={24} />
            </div>
          )}
          {showDesktopNav && (
            <div className="hidden md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
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
          {!isLoaded ? (
            <AuthSkeleton />
          ) : (
            <>
              <SignedOut>
                <AuthControls />
              </SignedOut>
              <SignedIn>
                {isUsageLoading ? (
                  <Skeleton className="h-8 w-20 rounded-md" />
                ) : hasNoCredits && !hasProAccess ? (
                  <Button asChild size="sm" className="h-8">
                    <Link href="/pricing">
                      <CrownIcon className="mr-2 h-4 w-4" />
                      Upgrade
                    </Link>
                  </Button>
                ) : (
                  usage && (
                    <UsagePopover
                      points={points}
                      hasProAccess={hasProAccess}
                      resetTime={resetTime}
                    />
                  )
                )}
                <UserMenu />
              </SignedIn>
            </>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <MobileNav
              pathname={mobilePathname || pathname}
              navItems={navItems}
            />
          </Sheet>
        </div>
      </div>
    </header>
  )
}
