import { ErrorBoundary } from 'react-error-boundary'
import { ProjectView } from '@/modules/projects/ui/views/project-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { APP_NAME } from '@/app/constants'

interface Props {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params

  try {
    const queryClient = getQueryClient()
    const project = await queryClient.fetchQuery(
      trpc.projects.getOne.queryOptions({ id: projectId })
    )

    return {
      title: `${APP_NAME} | ${project.name}`,
    }
  } catch {
    // Если проект не найден или произошла ошибка, используем базовое название
    return {
      title: APP_NAME,
    }
  }
}

const Page = async ({ params }: Props) => {
  const { projectId } = await params

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  )
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  )

  return (
    <div className="fixed inset-y-0 top-[52px] right-0 left-0 overflow-hidden md:group-data-[state=expanded]/sidebar-wrapper:left-[var(--sidebar-width)]">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={null}>
            <ProjectView projectId={projectId} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  )
}

export default Page
