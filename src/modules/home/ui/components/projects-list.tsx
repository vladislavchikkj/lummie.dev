'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { FolderX, Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import Logo from '@/components/ui/logo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTRPC } from '@/trpc/client'
import { GlowingEffect } from '@/components/ui/glowing-effect'

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
    ...trpc.projects.getMany.queryOptions(),
    refetchInterval: (query) => {
      const isAnyProjectPending = query.state.data?.some(
        (p) => p.status === 'PENDING'
      )
      return isAnyProjectPending ? 3000 : false
    },
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
          <div className="text-muted-foreground col-span-full text-center">
            Loading projects...
          </div>
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

        {filteredAndSortedProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block"
          >
            <div className="group bg-card relative flex h-full items-center gap-x-4 rounded-lg border p-4 transition-colors">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md">
                <Logo width={24} height={24} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <ProjectName project={project} />
                <p className="text-muted-foreground text-sm">
                  Updated{' '}
                  {formatDistanceToNow(project.updatedAt, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
