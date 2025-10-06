'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'

import { useTRPC } from '@/trpc/client'
import { Button } from './ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ProjectMenu } from '@/modules/projects/ui/components/project-menu'

const ProjectName = ({
  project,
}: {
  project: { name: string | null; status: string }
}) => {
  switch (project.status) {
    case 'PENDING':
      const isCreating = !project.name
      return (
        <span
          className={`truncate ${isCreating ? 'text-muted-foreground animate-pulse' : ''}`}
        >
          {project.name || 'Creating...'}
        </span>
      )
    case 'ERROR':
      return <span className="truncate text-red-500">Generation Failed</span>
    case 'COMPLETED':
    default:
      return <span className="truncate">{project.name || 'Untitled Chat'}</span>
  }
}

export function AppSidebar() {
  const trpc = useTRPC()

  const { data: projects, isLoading } = useQuery({
    ...trpc.projects.getMany.queryOptions(),
    refetchInterval: (query) => {
      const isAnyProjectPending = query.state.data?.some(
        (p) => p.status === 'PENDING'
      )
      return isAnyProjectPending ? 3000 : false
    },
  })

  const sortedProjects = projects?.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const { setOpen } = useSidebar()

  return (
    <Sidebar>
      <div className="p-2">
        <Button
          asChild
          className="flex w-full items-center justify-center rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          <Link href={'/'} onClick={() => setOpen(false)}>
            New Chat
          </Link>
        </Button>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-3">
            <span>Recent Chats</span>
            <ChevronDown className="h-4 w-4" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && (
                <SidebarMenuItem>
                  <span className="px-3 py-1.5 text-xs text-neutral-400">
                    Loading chats...
                  </span>
                </SidebarMenuItem>
              )}

              {!isLoading &&
                (!sortedProjects || sortedProjects.length === 0) && (
                  <SidebarMenuItem>
                    <span className="px-3 py-1.5 text-xs text-neutral-400">
                      No chats found.
                    </span>
                  </SidebarMenuItem>
                )}

              {sortedProjects?.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <div className="group hover:bg-accent/50 flex w-full items-center rounded-md px-2 transition-all duration-200">
                    <Link
                      href={`/projects/${project.id}`}
                      className="-m-2 min-w-0 flex-1 rounded-md p-2 transition-colors duration-200 hover:bg-transparent"
                      onClick={() => setOpen(false)}
                    >
                      <ProjectName project={project} />
                    </Link>
                    <div
                      className="ml-2 flex-shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ProjectMenu
                        projectId={project.id}
                        currentName={project.name || 'Untitled Chat'}
                      />
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
