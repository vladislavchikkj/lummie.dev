interface Props {
  points: number
  msBeforeNext: number
}

import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { formatDuration, intervalToDuration } from 'date-fns'
import { CrownIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export const Usage = ({ points, msBeforeNext }: Props) => {
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
        {!hasProAccess && (
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link href="/pricing">
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
