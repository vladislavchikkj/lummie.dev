'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

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
        className={cn('logo', className)}
      />
    )
  }

  // Для автоматической темы рендерим оба логотипа и скрываем через CSS
  // Это гарантирует одинаковый HTML на сервере и клиенте
  // /logo.svg - темный логотип для светлой темы
  // /logo-l.svg - светлый логотип для темной темы
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{ width, height }}
    >
      {/* Dark logo - показывается только в light mode */}
      <Image
        src="/logo.svg"
        alt="logo"
        width={width}
        height={height}
        className="logo absolute inset-0 block dark:hidden"
      />
      {/* Light logo - показывается только в dark mode */}
      <Image
        src="/logo-l.svg"
        alt="logo"
        width={width}
        height={height}
        className="logo absolute inset-0 hidden dark:block"
      />
    </span>
  )
}

export default Logo
