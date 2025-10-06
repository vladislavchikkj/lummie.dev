'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Header } from '@/components/ui/header'
import { ProjectHeaderContent } from '@/components/ui/project-header-content'
import { useTRPC } from '@/trpc/client'

interface Props {
  projectId: string
  applyScrollStyles?: boolean
}

export const ProjectHeader = ({
  projectId,
  applyScrollStyles = true,
}: Props) => {
  const trpc = useTRPC()
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  )

  const isPrivateProject = true

  return (
    <Header
      applyScrollStyles={applyScrollStyles}
      showDesktopNav={false}
      leftContent={
        <ProjectHeaderContent
          projectName={project?.name || 'Loading...'}
          isPrivate={isPrivateProject}
        />
      }
      mobilePathname="/projects"
    />
  )
}
