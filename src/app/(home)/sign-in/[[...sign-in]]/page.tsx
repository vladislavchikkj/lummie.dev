'use client'

import { useCurrentTheme } from '@/hooks/use-current-theme'
import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function Page() {
  const currentTheme = useCurrentTheme()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <section className="space-y-6">
        <div className="flex min-h-[520px] flex-col items-center justify-center">
          <SignIn
            appearance={{
              baseTheme: currentTheme === 'dark' ? dark : undefined,
              elements: {
                cardBox: 'border! shadow-none! rounded-lg!',
              },
            }}
          />
        </div>
      </section>
    </div>
  )
}
