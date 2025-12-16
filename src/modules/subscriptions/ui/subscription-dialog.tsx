'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Check } from 'lucide-react'

import { useTRPC } from '@/trpc/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SubscriptionDialog = ({
  open,
  onOpenChange,
}: SubscriptionDialogProps) => {
  const { user, isLoaded: isUserLoaded } = useUser()
  const { has, isLoaded } = useAuth()
  const router = useRouter()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isReloading, setIsReloading] = useState(false)

  const isPro = (user?.publicMetadata as { plan?: string })?.plan === 'pro'

  useEffect(() => {
    if (typeof window === 'undefined' || !user || !open) return
    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get('success')

    if (success === 'true' && !isReloading) {
      setIsReloading(true)
      router.replace(window.location.pathname, { scroll: false })

      const reloadUser = async () => {
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, i * 1000))
          await user.reload()
          const updatedPlan = (user.publicMetadata as { plan?: string })?.plan
          if (updatedPlan === 'pro') {
            queryClient.invalidateQueries(trpc.usage.status.queryOptions())
            break
          }
        }
        setIsReloading(false)
      }
      reloadUser()
    }
  }, [user, router, isReloading, queryClient, trpc, open])

  const handlePayment = (url?: string) => {
    if (url) window.location.href = url
  }

  const { mutate: createStripeSession, isPending } = useMutation(
    trpc.subscriptions.createCheckoutSession.mutationOptions({
      onSuccess: ({ url }) => handlePayment(url),
      onError: (err) => console.error(err),
    })
  )

  const { mutate: createPortalSession, isPending: isPortalPending } =
    useMutation(
      trpc.subscriptions.createCustomerPortal.mutationOptions({
        onSuccess: ({ url }) => handlePayment(url),
        onError: (err) => console.error(err),
      })
    )

  const getReturnUrl = () =>
    typeof window !== 'undefined' ? window.location.href : '/'

  const handleUpgrade = () => {
    if (!isLoaded) return
    if (!has) {
      router.push('/sign-in')
      onOpenChange(false)
      return
    }
    createStripeSession({ returnUrl: getReturnUrl() })
  }

  const handleManageSubscription = () => {
    if (!isLoaded || !isUserLoaded) return
    if (!has) {
      router.push('/sign-in')
      onOpenChange(false)
      return
    }
    createPortalSession({ returnUrl: getReturnUrl() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-sidebar m-0 h-screen w-screen max-w-none overflow-y-auto rounded-none border-none p-0 sm:h-auto sm:max-h-[90vh] sm:w-[95vw] sm:max-w-[900px] sm:rounded-3xl sm:border sm:shadow-2xl">
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center sm:pt-16 sm:pb-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold tracking-tight sm:text-5xl">
              Choose your plan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mx-auto mt-4 text-base sm:max-w-xl sm:text-xl">
              Simple pricing. No hidden fees. Cancel anytime.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 pb-12 sm:grid-cols-2 sm:gap-8 sm:px-12">
          <div className="border-border bg-background/50 flex flex-col rounded-3xl border p-6 transition-colors sm:p-8">
            <div className="mb-4">
              <h3 className="text-foreground/80 text-lg font-semibold">Free</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Perfect for getting started.
              </p>
            </div>

            <div className="my-4 flex items-baseline">
              <span className="text-4xl font-bold tracking-tighter">$0</span>
              <span className="text-muted-foreground ml-2">/ month</span>
            </div>

            <Separator className="mb-6 opacity-40" />

            <ul className="text-muted-foreground flex-1 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Check className="text-foreground/40 h-4 w-4" />
                <span>Limited monthly credits</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-foreground/40 h-4 w-4" />
                <span>Standard generation speed</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="text-foreground/40 h-4 w-4" />
                <span>Community access</span>
              </li>
            </ul>

            <div className="mt-8">
              <Button
                variant="ghost"
                className="border-border/40 text-muted-foreground hover:text-foreground h-12 w-full rounded-full border bg-transparent"
                disabled
              >
                {isPro ? 'Downgrade' : 'Current Plan'}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'relative flex flex-col overflow-hidden rounded-3xl p-6 transition-all sm:p-8',
              'bg-foreground text-background shadow-2xl ring-1 ring-white/10'
            )}
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Pro</h3>
                {!isPro && (
                  <p className="text-background/60 mt-1 text-xs font-medium tracking-wider uppercase">
                    Most Popular
                  </p>
                )}
              </div>
              {isPro && (
                <Badge
                  variant="outline"
                  className="border-background/30 text-background"
                >
                  Active
                </Badge>
              )}
            </div>

            <div className="relative z-10 my-4 flex items-baseline">
              <span className="text-5xl font-bold tracking-tighter">$25</span>
              <span className="text-background/60 ml-2">/ month</span>
            </div>

            <div className="bg-background/20 relative z-10 mb-6 h-px w-full" />

            <ul className="text-background/90 relative z-10 flex-1 space-y-4 text-sm font-medium">
              <li className="flex items-center gap-3">
                <div className="bg-background text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </div>
                <span>Unlimited Credits</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-background text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </div>
                <span>Access to GPT-5</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-background text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </div>
                <span>Fastest Generation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-background text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3" />
                </div>
                <span>Priority Support</span>
              </li>
            </ul>

            <div className="relative z-10 mt-8">
              {isPro ? (
                <Button
                  className="bg-background text-foreground hover:bg-background/90 h-12 w-full rounded-full font-medium"
                  onClick={handleManageSubscription}
                  disabled={isPortalPending || !isLoaded}
                >
                  {isPortalPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              ) : (
                <Button
                  className="bg-background text-foreground hover:bg-background/90 h-12 w-full rounded-full font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleUpgrade}
                  disabled={isPending || !isLoaded}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Get Pro Access'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
