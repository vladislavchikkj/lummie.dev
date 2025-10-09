'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  MessageSquarePlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Home,
  MessageCircle,
  Settings,
  User,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { usePathname } from 'next/navigation'

import { useTRPC } from '@/trpc/client'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { ProjectMenu } from '@/modules/projects/ui/components/project-menu'
import { cn } from '@/lib/utils'

const ProjectStatusIcon = ({
  status,
  sandboxId,
}: {
  status: string
  sandboxId?: string | null
}) => {
  switch (status) {
    case 'PENDING':
      if (sandboxId) {
        return (
          <Activity className="h-3 w-3 animate-pulse text-black dark:text-white" />
        )
      }
      return (
        <MessageCircle className="h-3 w-3 text-gray-600 dark:text-gray-400" />
      )
    case 'ERROR':
      return <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
    case 'COMPLETED':
    default:
      return (
        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
      )
  }
}

const ProjectName = ({
  project,
}: {
  project: {
    name: string | null
    status: string
    updatedAt: Date
    sandboxId?: string | null
  }
}) => {
  const isCreating = project.status === 'PENDING' && !project.name
  const isRecent =
    project.updatedAt.getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ProjectStatusIcon
        status={project.status}
        sandboxId={project.sandboxId}
      />
      <span
        className={cn(
          'truncate text-sm transition-colors',
          isCreating && 'text-muted-foreground animate-pulse',
          project.status === 'ERROR' && 'text-red-500',
          project.status === 'COMPLETED' && 'text-foreground'
        )}
      >
        {project.name || 'Creating...'}
      </span>
      {isRecent && project.status === 'COMPLETED' && (
        <Badge variant="secondary" className="h-auto px-1.5 py-0.5 text-xs">
          Recent
        </Badge>
      )}
    </div>
  )
}

export function AppSidebar() {
  const trpc = useTRPC()
  const pathname = usePathname()

  const { data: projects, isLoading } = useQuery({
    ...trpc.projects.getMany.queryOptions(),
    refetchInterval: (query) => {
      const isAnyProjectGenerating = query.state.data?.some(
        (p) => p.status === 'PENDING' && p.sandboxId
      )
      return isAnyProjectGenerating ? 3000 : false
    },
  })

  const sortedProjects = projects?.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  const { setOpen } = useSidebar()

  const generatingProjects =
    sortedProjects?.filter((p) => p.status === 'PENDING' && p.sandboxId) || []

  const pendingChats =
    sortedProjects?.filter((p) => p.status === 'PENDING' && !p.sandboxId) || []
  const completedProjects =
    sortedProjects?.filter((p) => p.status === 'COMPLETED') || []
  const errorProjects =
    sortedProjects?.filter((p) => p.status === 'ERROR') || []

  return (
    <Sidebar>
      <div className="p-4">
        <div className="space-y-2">
          <Button
            asChild
            variant="ghost"
            className="group text-foreground h-10 w-full justify-start rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Link
              href={'/'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <Home className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Home</span>
            </Link>
          </Button>

          <Button
            asChild
            className="group h-10 w-full rounded-lg bg-black font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-black/90 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Link
              href={'/'}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <MessageSquarePlus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
              <span>New Chat</span>
            </Link>
          </Button>
        </div>
      </div>

      <SidebarContent className="p-2">
        {/* Generating Projects - только проекты с sandboxId */}
        {generatingProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-600 duration-300 dark:text-gray-400">
              <Activity className="h-3 w-3 animate-pulse text-black dark:text-white" />
              <span>Generating</span>
              <Badge
                variant="secondary"
                className="animate-in zoom-in-50 ml-auto bg-black/10 text-xs text-black duration-300 dark:bg-white/10 dark:text-white"
              >
                {generatingProjects.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {generatingProjects.map((project, index) => (
                  <SidebarMenuItem
                    key={project.id}
                    className="animate-in slide-in-from-left-1 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/projects/${project.id}`}
                      className="group relative h-10 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3"
                      >
                        <ProjectName
                          project={{
                            name: project.name,
                            status: project.status,
                            updatedAt: project.updatedAt,
                            sandboxId: project.sandboxId,
                          }}
                        />
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          <ProjectMenu
                            projectId={project.id}
                            currentName={project.name || 'Untitled Chat'}
                          />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Recent Chats - завершенные чаты */}
        <SidebarGroup>
          <SidebarGroupLabel className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-600 duration-300 dark:text-gray-400">
            <TrendingUp className="h-3 w-3" />
            <span>Recent Chats</span>
            <Badge
              variant="outline"
              className="animate-in zoom-in-50 ml-auto border-black/10 bg-black/5 text-xs duration-300 dark:border-white/10 dark:bg-white/5"
            >
              {completedProjects.length}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading && (
                <SidebarMenuItem>
                  <div className="text-muted-foreground flex items-center gap-2 px-2 py-2 text-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading chats...</span>
                  </div>
                </SidebarMenuItem>
              )}

              {!isLoading && completedProjects.length === 0 && (
                <SidebarMenuItem>
                  <div className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                    <MessageSquarePlus className="text-muted-foreground/50 h-8 w-8" />
                    <span className="text-muted-foreground text-xs">
                      No recent chats
                    </span>
                    <span className="text-muted-foreground/70 text-xs">
                      Start a conversation
                    </span>
                  </div>
                </SidebarMenuItem>
              )}

              {/* Показываем завершенные чаты */}
              {completedProjects.map((project, index) => (
                <SidebarMenuItem
                  key={project.id}
                  className="animate-in slide-in-from-left-1 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/projects/${project.id}`}
                    className="group relative h-10 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                  >
                    <Link
                      href={`/projects/${project.id}`}
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-3"
                    >
                      <ProjectName
                        project={{
                          name: project.name,
                          status: project.status,
                          updatedAt: project.updatedAt,
                          sandboxId: project.sandboxId,
                        }}
                      />
                      <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                        <ProjectMenu
                          projectId={project.id}
                          currentName={project.name || 'Untitled Chat'}
                        />
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pending Chats - обычные чаты в ожидании */}
        {pendingChats.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-600 duration-300 dark:text-gray-400">
              <MessageCircle className="h-3 w-3" />
              <span>Pending Chats</span>
              <Badge
                variant="outline"
                className="animate-in zoom-in-50 ml-auto border-black/10 bg-black/5 text-xs duration-300 dark:border-white/10 dark:bg-white/5"
              >
                {pendingChats.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pendingChats.map((project, index) => (
                  <SidebarMenuItem
                    key={project.id}
                    className="animate-in slide-in-from-left-1 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/projects/${project.id}`}
                      className="group relative h-10 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3"
                      >
                        <ProjectName
                          project={{
                            name: project.name,
                            status: project.status,
                            updatedAt: project.updatedAt,
                            sandboxId: project.sandboxId,
                          }}
                        />
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          <ProjectMenu
                            projectId={project.id}
                            currentName={project.name || 'Untitled Chat'}
                          />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Error Projects */}
        {errorProjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="animate-in slide-in-from-top-1 flex items-center gap-2 px-2 py-1 text-xs font-medium text-red-600 duration-300 dark:text-red-400">
              <AlertCircle className="h-3 w-3 animate-pulse" />
              <span>Failed</span>
              <Badge
                variant="destructive"
                className="animate-in zoom-in-50 ml-auto border-red-200 bg-red-100 text-xs text-red-700 duration-300 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
              >
                {errorProjects.length}
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {errorProjects.map((project, index) => (
                  <SidebarMenuItem
                    key={project.id}
                    className="animate-in slide-in-from-left-1 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/projects/${project.id}`}
                      className="group relative h-10 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-red-50/50 dark:hover:bg-red-950/10"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3"
                      >
                        <ProjectName
                          project={{
                            name: project.name,
                            status: project.status,
                            updatedAt: project.updatedAt,
                            sandboxId: project.sandboxId,
                          }}
                        />
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          <ProjectMenu
                            projectId={project.id}
                            currentName={project.name || 'Untitled Chat'}
                          />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Actions & Stats */}
        <div className="mt-auto space-y-3 p-4">
          {/* Stats */}
          <div className="rounded-lg border border-black/10 bg-black/2 p-3 dark:border-white/10 dark:bg-white/2">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Today
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {completedProjects.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Recent</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {pendingChats.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {generatingProjects.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Active</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Settings className="mr-2 h-3 w-3" />
              <span className="text-xs">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <User className="mr-2 h-3 w-3" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
