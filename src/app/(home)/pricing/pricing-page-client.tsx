'use client'

import { useEffect, useState } from 'react'
import { SubscriptionDialog } from '@/modules/subscriptions/ui/subscription-dialog'

export const PricingPageClient = () => {
  const [open, setOpen] = useState(false)

  // Автоматически открываем dialog при загрузке страницы
  useEffect(() => {
    setOpen(true)
  }, [])

  // Также проверяем success параметр
  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get('success')
    if (success === 'true') {
      setOpen(true)
    }
  }, [])

  return <SubscriptionDialog open={open} onOpenChange={setOpen} />
}

