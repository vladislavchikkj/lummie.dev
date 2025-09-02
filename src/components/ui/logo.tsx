'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  className?: string
}

const Logo = ({ width, height, theme: propTheme, className }: LogoProps) => {
  const { theme: systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = propTheme ?? (mounted ? systemTheme : 'dark')
  const logoSrc = currentTheme === 'light' ? '/logo.svg' : '/logo-l.svg'

  return (
    <Image
      src={logoSrc}
      alt="logo"
      width={width}
      height={height}
      className={`logo ${className}`}
    />
  )
}

export default Logo
