'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { SheetClose } from '@/components/ui/sheet'
import { useCurrentTheme } from '@/hooks/use-current-theme'
import { dark } from '@clerk/themes'

interface AuthControlsProps {
  mobile?: boolean
}

export const AuthControls = ({ mobile }: AuthControlsProps) => {
  const currentTheme = useCurrentTheme()

  const appearance = {
    baseTheme: currentTheme === 'dark' ? dark : undefined,
    elements: {
      modalContent: 'border! shadow-none! rounded-lg!',
      cardBox: 'border! shadow-none! rounded-lg!',
    },
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-4">
        <SheetClose asChild>
          <SignUpButton mode="modal" appearance={appearance}>
            <Button variant="outline" className="w-full">
              Sign up
            </Button>
          </SignUpButton>
        </SheetClose>
        <SheetClose asChild>
          <SignInButton mode="modal" appearance={appearance}>
            <Button className="from-primary to-primary/80 w-full bg-gradient-to-r">
              Sign in
            </Button>
          </SignInButton>
        </SheetClose>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <SignUpButton mode="modal" appearance={appearance}>
        <Button variant="outline" size="sm" className="hover:bg-primary/10">
          Sign up
        </Button>
      </SignUpButton>
      <SignInButton mode="modal" appearance={appearance}>
        <Button
          size="sm"
          className="from-primary to-primary/80 hover:from-primary/90 bg-gradient-to-r"
        >
          Sign in
        </Button>
      </SignInButton>
    </div>
  )
}
