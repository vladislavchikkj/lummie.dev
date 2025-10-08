'use client'

import { usePathname } from 'next/navigation'
import { ProjectHeader } from '@/modules/projects/ui/components/project-header'
import { Header } from '@/components/ui/header'

export const DynamicNavbar = () => {
  const pathname = usePathname()

  // Извлекаем projectId из URL
  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/)
  const projectId = projectMatch?.[1]

  // Проверяем, находимся ли мы на странице проекта
  const isProjectPage = pathname.startsWith('/projects/') && projectId

  if (isProjectPage) {
    return <ProjectHeader projectId={projectId} />
  }

  // Для обычных страниц используем Header напрямую
  return <Header />
}
