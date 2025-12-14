'use client'
import { dark } from '@clerk/themes'
import { UserButton } from '@clerk/nextjs'
import { useCurrentTheme } from '@/hooks/use-current-theme'
import { useIsMobile } from '@/hooks/use-mobile'

interface Props {
  showName?: boolean
}

export const UserControl = ({ showName }: Props) => {
  const currentTheme = useCurrentTheme()
  const isMobile = useIsMobile()

  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: isMobile ? 'rounded-full!' : 'rounded-md!',
          userButtonAvatarBox: isMobile
            ? 'rounded-full! size-8!'
            : 'rounded-md! size-8!',
          userButtonTrigger: isMobile ? 'rounded-full!' : 'rounded-md!',
          // Скрытие внутренних лейблов Clerk
          userButtonLabel: 'hidden!',
        },
        baseTheme: currentTheme === 'dark' ? dark : undefined,
      }}
    />
  )
}
