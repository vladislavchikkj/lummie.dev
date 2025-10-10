'use client'

import { useMemo, useState, memo } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { FolderX, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import Logo from '@/components/ui/logo'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTRPC } from '@/trpc/client'
import { ProjectMenu } from '@/modules/projects/ui/components/project-menu'
import type { JsonValue } from '@prisma/client/runtime/library'

interface FragmentPreview {
  id: string
  sandboxUrl: string
  title: string
  files: JsonValue
}

const PreviewIframe = memo(({ sandboxUrl }: { sandboxUrl: string }) => {
  const cacheKey = useMemo(() => {
    const url = new URL(sandboxUrl)
    return `${url.origin}${url.pathname}`
  }, [sandboxUrl])

  return (
    <iframe
      key={cacheKey}
      src={sandboxUrl}
      className="h-full w-full border-0"
      title="Project Preview"
      sandbox="allow-scripts allow-same-origin"
      style={{
        pointerEvents: 'none',
        transform: 'scale(0.5)',
        transformOrigin: 'top left',
        width: '200%',
        height: '200%',
      }}
    />
  )
})

PreviewIframe.displayName = 'PreviewIframe'

const ProjectCardSkeleton = () => (
  <div className="group bg-card relative flex h-full flex-col overflow-hidden rounded-xl border">
    {/* Header skeleton */}
    <div className="bg-muted/20 flex items-center gap-3 border-b p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>

    {/* Preview area skeleton */}
    <div className="bg-muted/10 relative aspect-video w-full overflow-hidden">
      <div className="flex h-full w-full items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-8 rounded" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Gradient overlay skeleton */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <Skeleton className="h-4 w-24 bg-white/20" />
        <Skeleton className="mt-1 h-3 w-16 bg-white/20" />
      </div>
    </div>

    {/* Footer skeleton */}
    <div className="bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full bg-green-500/50" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  </div>
)

const ProjectName = ({
  project,
}: {
  project: { name: string | null; status: string }
}) => {
  switch (project.status) {
    case 'PENDING':
      const isCreating = !project.name
      return (
        <h3
          className={`truncate font-medium ${isCreating ? 'animate-pulse' : ''}`}
        >
          {project.name || 'Creating...'}
        </h3>
      )
    case 'ERROR':
      return (
        <h3 className="truncate font-medium text-red-500">Generation Failed</h3>
      )
    case 'COMPLETED':
    default:
      return (
        <h3 className="truncate font-medium">
          {project.name || 'Untitled Project'}
        </h3>
      )
  }
}

export const ProjectsList = () => {
  const trpc = useTRPC()
  const { user } = useUser()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  const { data: projects, isLoading } = useQuery({
    ...trpc.projects.getManyWithPreview.queryOptions(),
    enabled: !!user, // Выполнять запрос только если пользователь авторизован
    refetchInterval: (query) => {
      const isAnyProjectPending = query.state.data?.some(
        (p) => p.status === 'PENDING'
      )
      return isAnyProjectPending ? 3000 : false
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return []

    const filtered = projects.filter((project) =>
      (project.name || 'Untitled Project')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )

    switch (sortBy) {
      case 'oldest':
        return filtered.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
      case 'az':
        return filtered.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        )
      case 'za':
        return filtered.sort((a, b) =>
          (b.name || '').localeCompare(a.name || '')
        )
      case 'latest':
      default:
        return filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }
  }, [projects, searchQuery, sortBy])

  if (!user) return null

  return (
    <div className="flex w-full max-w-7xl flex-col gap-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">
          {user?.firstName}&apos;s Workspace
        </h2>

        <div className="flex items-center gap-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
              <SelectItem value="za">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        )}

        {!isLoading && filteredAndSortedProjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center gap-y-4 rounded-lg border-2 border-dashed py-16 text-center">
            <FolderX className="text-muted-foreground h-10 w-10" />
            <h3 className="text-lg font-medium">No Projects Found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'Try adjusting your search or filter.'
                : "You haven't created any projects yet."}
            </p>
          </div>
        )}

        {filteredAndSortedProjects.map((project) => {
          const previewFragment =
            project.latestFragment as FragmentPreview | null

          return (
            <div
              key={project.id}
              className="group bg-card hover:border-primary/20 relative flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300"
            >
              <div className="bg-muted/20 flex items-center gap-3 border-b p-4">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Logo width={20} height={20} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <ProjectName project={project} />
                  <p className="text-muted-foreground text-xs">
                    Chat •{' '}
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <ProjectMenu
                    projectId={project.id}
                    currentName={project.name || 'Untitled Project'}
                  />
                </div>
              </div>

              <Link
                href={`/projects/${project.id}`}
                className="flex flex-1 flex-col"
              >
                <div className="bg-muted/10 relative aspect-video w-full overflow-hidden">
                  {previewFragment && previewFragment.sandboxUrl ? (
                    <div className="pointer-events-none h-full w-full">
                      <PreviewIframe sandboxUrl={previewFragment.sandboxUrl} />
                    </div>
                  ) : (
                    <div className="from-muted/20 to-muted/40 flex h-full w-full items-center justify-center bg-gradient-to-br">
                      <div className="text-center">
                        <Logo
                          width={32}
                          height={32}
                          className="text-muted-foreground/60 mx-auto mb-2"
                        />
                        <p className="text-muted-foreground/60 text-xs">
                          No preview available
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-sm font-medium text-white">
                      Project Preview
                    </p>
                    <p className="text-xs text-white/80">Click to open chat</p>
                  </div>
                </div>

                <div className="bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground text-sm">
                        Active chat
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Logo
                        width={12}
                        height={12}
                        className="text-muted-foreground"
                      />
                      <span className="text-muted-foreground text-xs">
                        Powered by Lummie
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
