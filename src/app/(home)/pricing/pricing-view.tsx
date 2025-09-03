'use client'

import { PricingTable } from '@clerk/nextjs'
import Logo from '@/components/ui/logo'
import { dark } from '@clerk/themes'
import { useCurrentTheme } from '@/hooks/use-current-theme'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'

const PricingView = () => {
  const currentTheme = useCurrentTheme()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <div className="z-5">
        <BackgroundRippleEffect />
      </div>
      <section className="relative z-10 space-y-6">
        <div className="flex flex-col items-center">
          <Logo width={50} height={30} className="hidden md:block" />
        </div>
        <h1 className="text-center text-xl font-bold md:text-3xl">Pricing</h1>
        <p className="text-muted-foreground text-center text-sm md:text-base">
          Choose the plan that works best for you
        </p>
        <PricingTable
          appearance={{
            baseTheme: currentTheme === 'dark' ? dark : undefined,
            elements: {
              pricingTableCard: 'border! shadow-none! rounded-lg!',
            },
          }}
        />
      </section>
    </div>
  )
}

export default PricingView
