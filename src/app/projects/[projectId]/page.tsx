import { ErrorBoundary } from 'react-error-boundary'
import { ProjectView } from '@/modules/projects/ui/views/project-view'
import { Suspense } from 'react'
import { ProjectViewSkeleton } from '@/modules/projects/ui/views/project-view-skeleton'

import { getQueryClient } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

interface Props {
  params: {
    projectId: string
  }
}

const Page = ({ params }: Props) => {
  const { projectId } = params

  const queryClient = getQueryClient()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<ProjectViewSkeleton />}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  )
}

export default Page
