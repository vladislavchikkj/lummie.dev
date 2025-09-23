'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

import { useTRPC } from '@/trpc/client'
import { Button } from './ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const ProjectName = ({
  project,
}: {
  project: { name: string | null; status: string }
}) => {
  switch (project.status) {
    case 'PENDING':
      return (
        <span className="text-muted-foreground animate-pulse truncate">
          Generating...
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
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
                    <SidebarMenuButton className="w-full justify-between hover:bg-neutral-800">
                      <ProjectName project={project} />
                      <MoreHorizontal className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
