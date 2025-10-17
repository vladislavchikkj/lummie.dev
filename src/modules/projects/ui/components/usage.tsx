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
    <div className="bg-card border-border rounded-t-3xl border-2 border-b-0 p-3">
      <div className="flex items-center gap-x-3">
        <div className="flex-1">
          <p className="text-sm font-medium">
            {points} {hasProAccess ? '' : 'free'} credits remaining
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Resets in {resetTime}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          {!hasProAccess && (
            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link href="/pricing">
                <CrownIcon className="mr-2 size-4" /> Upgrade
              </Link>
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-xl"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
