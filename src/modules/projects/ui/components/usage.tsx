import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { formatDuration, intervalToDuration } from 'date-fns'
import { CrownIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

interface Props {
  points: number
  msBeforeNext: number
  onClose: () => void
}

export const Usage = ({ points, msBeforeNext, onClose }: Props) => {
  const { has } = useAuth()
  const hasProAccess = has?.({ plan: 'pro' })

  const resetTime = useMemo(() => {
    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + msBeforeNext),
        }),
        { format: ['months', 'days', 'hours'] }
      )
    } catch (error) {
      console.error('Error formatting duration', error)
      return '...'
    }
  }, [msBeforeNext])

  return (
    <div className="border-border bg-card rounded-t-2xl border p-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-1 w-1 rounded-full"></div>
            <span className="text-card-foreground text-sm font-semibold">
              {points} {hasProAccess ? '' : 'free'} credits
            </span>
          </div>
          <div className="bg-border h-4 w-px"></div>
          <span className="text-muted-foreground text-xs font-medium">
            Resets in {resetTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!hasProAccess && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs font-medium"
            >
              <Link href="/pricing">
                <CrownIcon className="mr-1.5 size-3" /> Upgrade
              </Link>
            </Button>
          )}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded-md transition-colors"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
