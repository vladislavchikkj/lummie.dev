'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CircleDollarSign, CrownIcon } from 'lucide-react'
import Link from 'next/link'

interface UsagePopoverProps {
  points: number
  hasProAccess: boolean | undefined
  resetTime: string
}

export const UsagePopover = ({
  points,
  hasProAccess,
  resetTime,
}: UsagePopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 gap-1 md:h-8 md:w-auto md:px-3"
        >
          <CircleDollarSign className="h-4 w-4" />
          <span className="hidden md:ml-2 md:inline">{Math.round(points)}</span>
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold md:hidden">
            {Math.round(points)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="leading-none font-medium">
              {points} {hasProAccess ? '' : 'free'} credits remaining
            </h4>
            <p className="text-muted-foreground text-sm">
              Resets in {resetTime}
            </p>
          </div>
          {!hasProAccess && (
            <Button asChild size="sm" className="w-full">
              <Link href="/pricing">
                <CrownIcon className="mr-2 h-4 w-4" /> Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
