'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { Header } from '@/components/ui/header'
import { ProjectHeaderContent } from '@/components/ui/project-header-content'
import { useTRPC } from '@/trpc/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  // Используем useQuery вместо useSuspenseQuery с условием enabled
  const { data: project } = useQuery({
    ...trpc.projects.getOne.queryOptions({ id: projectId }),
    enabled: !!userId, // Выполнять запрос только если пользователь авторизован
  })

  // Ждем загрузки Clerk
  useEffect(() => {
    if (isLoaded && !userId) {
      // Если Clerk загрузился и пользователь не авторизован, редирект на главную
      router.push('/')
    }
  }, [isLoaded, userId, router])

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
