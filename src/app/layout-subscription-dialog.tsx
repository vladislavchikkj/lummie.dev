'use client'

import { SubscriptionDialog } from '@/modules/subscriptions/ui/subscription-dialog'
import { useSubscriptionDialog } from '@/modules/subscriptions/hooks/use-subscription-dialog'

export function SubscriptionDialogWrapper() {
  const { open, setOpen } = useSubscriptionDialog()
  return <SubscriptionDialog open={open} onOpenChange={setOpen} />
}

