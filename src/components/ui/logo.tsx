'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

interface LogoProps {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  className?: string
}

const Logo = ({ width, height, theme: propTheme, className }: LogoProps) => {
  const { resolvedTheme } = useTheme()

  // Если передан пропс темы - используем его напрямую
  if (propTheme) {
    const logoSrc = propTheme === 'light' ? '/logo.svg' : '/logo-l.svg'
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

  // Для автоматической темы рендерим оба логотипа и скрываем через CSS
  // Это гарантирует одинаковый HTML на сервере и клиенте
  return (
    <>
      {/* Light theme logo - показывается только в light mode */}
      <Image
        src="/logo.svg"
        alt="logo"
        width={width}
        height={height}
        className={`logo ${className} block dark:hidden`}
      />
      {/* Dark theme logo - показывается только в dark mode */}
      <Image
        src="/logo-l.svg"
        alt="logo"
        width={width}
        height={height}
        className={`logo ${className} hidden dark:block`}
      />
    </>
  )
}

export default Logo
