'use client'

import { Header } from '@/components/ui/header'

interface NavbarProps {
  showDesktopNav?: boolean
  applyScrollStyles?: boolean
}

export const Navbar = ({
  showDesktopNav = true,
  applyScrollStyles = true,
}: NavbarProps) => {
  return (
    <Header
      showDesktopNav={showDesktopNav}
      applyScrollStyles={applyScrollStyles}
    />
  )
}
