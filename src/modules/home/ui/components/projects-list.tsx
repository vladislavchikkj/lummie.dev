'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { FolderX, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import Logo from '@/components/ui/logo'

interface FragmentPreview {
  id: string
  sandboxUrl: string
  title: string
  screenshot: string | null
}

const ProjectCardSkeleton = () => (
  <div className="group bg-card relative flex flex-col overflow-hidden rounded-xl border">
    <Skeleton className="aspect-[16/10] w-full" />
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
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
  const [isMounted, setIsMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [visibleCount, setVisibleCount] = useState(6)

  // Предотвращаем проблему гидратации, проверяя монтирование компонента
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Данные могут быть prefetch-ены на сервере, поэтому enabled=true
  // Запрос не будет выполняться повторно если данные уже есть в кэше
  const { data: projects, isLoading } = useQuery({
    ...trpc.projects.getManyWithPreview.queryOptions(),
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

    // Фильтруем только проекты с latestFragment и по поисковому запросу
    const filtered = projects.filter((project) => {
      const hasFragment = !!project.latestFragment
      const matchesSearch = (project.name || 'Untitled Project')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      return hasFragment && matchesSearch
    })

    let sorted
    switch (sortBy) {
      case 'oldest':
        sorted = filtered.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        break
      case 'az':
        sorted = filtered.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        )
        break
      case 'za':
        sorted = filtered.sort((a, b) =>
          (b.name || '').localeCompare(a.name || '')
        )
        break
      case 'latest':
      default:
        sorted = filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }

    return sorted
  }, [projects, searchQuery, sortBy])

  const visibleProjects = filteredAndSortedProjects.slice(0, visibleCount)
  const hasMore = filteredAndSortedProjects.length > visibleCount

  // Используем suppressHydrationWarning для заголовка, так как имя пользователя
  // доступно только на клиенте после загрузки Clerk
  return (
    <div className="flex w-full max-w-7xl flex-col gap-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold" suppressHydrationWarning>
          {user?.firstName ? `${user.firstName}'s Workspace` : 'Your Workspace'}
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

        {!isLoading && visibleProjects.length === 0 && (
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

        {visibleProjects.map((project) => {
          const previewFragment =
            project.latestFragment as FragmentPreview | null

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group bg-card hover:border-primary/30 relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200"
            >
              {/* Preview */}
              <div className="bg-muted/30 relative aspect-[16/10] w-full overflow-hidden">
                {previewFragment?.screenshot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewFragment.screenshot}
                    alt={project.name || 'Project Preview'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Logo
                      width={40}
                      height={40}
                      className="text-muted-foreground/40"
                    />
                  </div>
                )}

                {/* View details overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
                    View details
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 p-4">
                {isMounted && user?.imageUrl ? (
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <span className="text-muted-foreground text-xs font-medium">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <ProjectName project={project} />
                  <p className="text-muted-foreground truncate text-xs">
                    Edited{' '}
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Menu button */}
                <div
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <ProjectMenu
                    projectId={project.id}
                    currentName={project.name || 'Untitled Project'}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
