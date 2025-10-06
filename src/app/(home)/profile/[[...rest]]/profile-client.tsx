'use client'

import { useCurrentTheme } from '@/hooks/use-current-theme'
import { UserProfile } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export function ProfileClient() {
  const currentTheme = useCurrentTheme()

  return (
    <UserProfile
      appearance={{
        baseTheme: currentTheme === 'dark' ? dark : undefined,
      }}
    />
  )
}
