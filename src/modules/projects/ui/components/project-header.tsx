'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { Header } from '@/components/ui/header'
import { ProjectHeaderContent } from '@/components/ui/project-header-content'
import { useTRPC } from '@/trpc/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  projectId: string
  applyScrollStyles?: boolean
}

export const ProjectHeader = ({
  projectId,
  applyScrollStyles = true,
}: Props) => {
  const trpc = useTRPC()
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  const { data: project, error } = useQuery({
    ...trpc.projects.getOne.queryOptions({ id: projectId }),
    enabled: !!userId,
    retry: false,
  })

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/')
    }
  }, [isLoaded, userId, router])

  useEffect(() => {
    if (error && isLoaded && userId) {
      const errorMessage = error?.message || ''
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('NOT_FOUND')
      ) {
        toast.error('Project not found')
        router.push('/')
      }
    }
  }, [error, isLoaded, userId, router])

  const isPrivateProject = true

  return (
    <Header
      applyScrollStyles={applyScrollStyles}
      showDesktopNav={false}
      leftContent={
        <ProjectHeaderContent
          projectName={project?.name || 'Loading...'}
          projectId={projectId}
          isPrivate={isPrivateProject}
        />
      }
      mobilePathname="/projects"
    />
  )
}
