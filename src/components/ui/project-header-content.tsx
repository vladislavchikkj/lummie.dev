'use client'

import { ChevronDown, Lock } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { useSidebar } from '@/components/ui/sidebar'

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
    <div
      onClick={toggleSidebar}
      className="flex cursor-pointer items-center gap-3 rounded-lg bg-transparent transition-colors"
    >
      <Logo width={24} height={24} />

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
