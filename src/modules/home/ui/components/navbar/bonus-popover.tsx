'use client'

import { useState, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Gift } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'

const STORAGE_KEY = 'bonus-popover-clicked'
const TARGET_GENERATIONS = 100
const FREE_POINTS = 2
const PRO_POINTS = 100

export const BonusPopover = () => {
  const [showIndicator, setShowIndicator] = useState(false)
  const trpc = useTRPC()
  const { userId, has } = useAuth()

  const { data: usage, isLoading } = useQuery({
    ...trpc.usage.status.queryOptions(),
    enabled: !!userId,
  })

  const hasProAccess = has?.({ plan: 'pro' })
  const remainingPoints = usage?.remainingPoints ?? 0
  const initialPoints = hasProAccess ? PRO_POINTS : FREE_POINTS
  const generationsCount = Math.max(initialPoints - remainingPoints, 0)
  const progress = Math.min((generationsCount / TARGET_GENERATIONS) * 100, 100)
  const remaining = Math.max(TARGET_GENERATIONS - generationsCount, 0)

  useEffect(() => {
    const hasBeenClicked = localStorage.getItem(STORAGE_KEY)
    if (!hasBeenClicked) {
      setShowIndicator(true)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (open && showIndicator) {
      setShowIndicator(false)
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  return (
    <div className="hidden md:block">
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent relative rounded-full"
            aria-label="Rewards"
          >
            <Gift className="h-5 w-5" />

            {showIndicator && (
              <div className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary/90 relative inline-flex h-2 w-2 rounded-full"></span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none tracking-tight">
                Reward Progress
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete {TARGET_GENERATIONS} generations to unlock your bonus
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-normal">
                  Generations
                </span>
                <span className="text-xs font-medium tabular-nums tracking-tight">
                  {isLoading ? '...' : `${generationsCount} / ${TARGET_GENERATIONS}`}
                </span>
              </div>
              
              <Progress 
                value={progress} 
                className="h-1 bg-gray-100 dark:bg-gray-800/50 [&_[data-slot=progress-indicator]]:bg-black [&_[data-slot=progress-indicator]]:dark:bg-white [&_[data-slot=progress-indicator]]:rounded-full"
              />
              
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {remaining} more {remaining === 1 ? 'generation' : 'generations'} until reward
                </p>
              )}
              
              {remaining === 0 && (
                <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                  Reward unlocked! Check your next purchase.
                </p>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
