'use client'

import { ChevronDown, Lock, Menu } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'

interface ProjectHeaderContentProps {
  projectName: string
  isPrivate?: boolean
}

export const ProjectHeaderContent = ({
  projectName,
  isPrivate = false,
}: ProjectHeaderContentProps) => {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="flex items-center gap-3 rounded-lg bg-transparent transition-colors">
      {/* Mobile: Menu icon that toggles sidebar */}
      <div
        className="flex cursor-pointer items-center gap-1 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </div>
      
      {/* Desktop: Logo link to home */}
      <Link
        href="/"
        className="hidden cursor-pointer items-center gap-1 transition-all hover:opacity-80 md:flex"
      >
        <Logo width={24} height={24} />
      </Link>

      <div className="bg-border h-6 w-px" />

      <div className="flex flex-col items-start justify-center">
        <div className="flex items-center gap-1.5 pb-1">
          <span className="text-foreground text-sm leading-none font-semibold">
            {projectName}
          </span>
          {isPrivate && <Lock className="text-muted-foreground h-3 w-3" />}
        </div>
        <span className="text-muted-foreground text-xs leading-none">
          View Projects
        </span>
      </div>

      <ChevronDown className="text-muted-foreground h-4 w-4" />
    </div>
  )
}
