'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
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

interface Props {
  projectId: string
  applyScrollStyles?: boolean
}

export const ProjectHeader = ({
  projectId,
  applyScrollStyles = true,
}: Props) => {
  const trpc = useTRPC()
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  )

  const { toggleSidebar } = useSidebar()
  const isScrolled = useScroll()
  const { isLoaded, has } = useAuth()

  const { data: usage, isLoading: isUsageLoading } = useQuery(
    trpc.usage.status.queryOptions()
  )

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
        'fixed top-0 right-0 left-0 z-50 border-transparent bg-transparent px-4 py-2 transition-all duration-300',
        isScrolled &&
          applyScrollStyles &&
          'bg-background/95 shadow-sm backdrop-blur-xl'
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="flex cursor-pointer items-center gap-2 p-0! px-0 py-0 transition-all hover:bg-transparent hover:opacity-80"
          >
            <Logo width={24} height={24} />
            <span className="font-medium">{project?.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
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
            <MobileNav pathname="/projects" navItems={navItems} />
          </Sheet>
        </div>
      </div>
    </header>
  )
}
