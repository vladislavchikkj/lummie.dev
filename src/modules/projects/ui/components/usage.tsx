import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { formatDuration, intervalToDuration } from 'date-fns'
import { CrownIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

interface Props {
  points: number
  msBeforeNext: number
  onClose: () => void // Added onClose prop
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
    <div className="bg-background rounded-t-xl border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProAccess ? '' : 'free'} credits remaining
          </p>
          <p className="text-muted-foreground text-xs">Resets in {resetTime}</p>
        </div>
        <div className="ml-auto flex items-center gap-x-2">
          {!hasProAccess && (
            <Button asChild size="sm" variant="outline">
              <Link href="/pricing">
                <CrownIcon className="mr-2 size-4" /> Upgrade
              </Link>
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={onClose} // Close button functionality
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
