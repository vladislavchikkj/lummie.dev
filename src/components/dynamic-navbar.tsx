'use client'

import { usePathname } from 'next/navigation'
import { ProjectHeader } from '@/modules/projects/ui/components/project-header'
import { Header } from '@/components/ui/header'

export const DynamicNavbar = () => {
  const pathname = usePathname()

  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/)
  const projectId = projectMatch?.[1]

  const isProjectPage = pathname.startsWith('/projects/') && projectId

  if (isProjectPage) {
    return <ProjectHeader projectId={projectId} />
  }

  return <Header />
}
