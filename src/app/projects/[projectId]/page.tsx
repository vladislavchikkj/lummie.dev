import { ErrorBoundary } from 'react-error-boundary'
import { ProjectView } from '@/modules/projects/ui/views/project-view'
import { getQueryClient, trpc, caller } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { projectId } = params

	try {
		const project = await caller.projects.getOne({ id: projectId })

		if (!project) {
			return {
				title: 'Project Not Found',
			}
		}

		return {
			title: `${project.name ?? 'Generating...'} | Lummie`,
		}
	} catch {
		return {
			title: 'Error',
			description: 'Could not fetch project data.',
		}
	}
}

interface Props {
	params: {
		projectId: string
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
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<Suspense fallback={<div>Loading...</div>}>
					<ProjectView projectId={projectId} />
				</Suspense>
			</ErrorBoundary>
		</HydrationBoundary>
	)
}

export default Page
