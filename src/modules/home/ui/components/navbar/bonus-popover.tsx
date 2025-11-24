'use client'

import { useState, useEffect } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gift, Copy } from 'lucide-react'

const STORAGE_KEY = 'bonus-popover-clicked'

export const BonusPopover = () => {
  const promoCode = 'GET-BONUS-2025'

  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const hasBeenClicked = localStorage.getItem(STORAGE_KEY)
    if (!hasBeenClicked) {
      setShowIndicator(true)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }

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
            aria-label="Bonuses"
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
        <PopoverContent align="end" className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Referral Bonus</h4>
              <p className="text-muted-foreground text-sm">
                Share this promo code with a friend. When they use it, you both
                get a bonus!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="promo-code" className="sr-only">
                  Promo Code
                </Label>
                <Input id="promo-code" value={promoCode} readOnly />
              </div>
              <Button size="sm" className="px-3" onClick={handleCopy}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
