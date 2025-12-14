'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface PulsingLogoProps {
  width?: number
  height?: number
  className?: string
}

export const PulsingLogo = ({
  width = 24,
  height = 24,
  className,
}: PulsingLogoProps) => {
  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      style={{
        animation: 'logo-pulse 1.5s ease-in-out infinite',
      }}
    >
      {/* Light theme logo - показывается только в light mode */}
      <Image
        src="/logo.svg"
        alt="logo"
        width={width}
        height={height}
        className={cn('block drop-shadow-sm dark:hidden')}
      />
      {/* Dark theme logo - показывается только в dark mode */}
      <Image
        src="/logo-l.svg"
        alt="logo"
        width={width}
        height={height}
        className={cn('hidden drop-shadow-sm dark:block')}
      />
    </div>
  )
}
