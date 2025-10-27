'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  MessageSquarePlus,
  Loader2,
  User,
  Cog,
  FolderOpen,
  MessageSquare,
  XCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Clock,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'

import { useTRPC } from '@/trpc/client'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { ProjectMenu } from '@/modules/projects/ui/components/project-menu'
import { cn } from '@/lib/utils'
import Logo from './ui/logo'

const CollapsibleGroupLabel = ({
  icon: Icon,
  title,
  count,
  variant = 'default',
  isCollapsed,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
  variant?: 'default' | 'error'
  isCollapsed: boolean
  onToggle: () => void
}) => {
  const baseClasses =
    'animate-in slide-in-from-top-1 flex items-center gap-2 px-2 py-1 text-xs font-medium duration-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors'
  const colorClasses =
    variant === 'error'
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-400'

  return (
    <div className={cn(baseClasses, colorClasses)} onClick={onToggle}>
      {isCollapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronDown className="h-3 w-3" />
      )}
      <Icon className={cn('h-3 w-3', variant === 'error' && 'animate-pulse')} />
      <span>{title}</span>
      <Badge
        variant={variant === 'error' ? 'destructive' : 'outline'}
        className={cn(
          'animate-in zoom-in-50 ml-auto text-xs duration-300',
          variant === 'error'
            ? 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5'
        )}
      >
        {count}
      </Badge>
    </div>
  )
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
  const { userId } = useAuth()

  // Состояние для сворачивания групп
  const [collapsedGroups, setCollapsedGroups] = useState({
    latest: false,
    generating: false,
    recent: false,
    pending: false,
    failed: false,
  })

  const toggleGroup = (group: keyof typeof collapsedGroups) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const { data: projects, isLoading } = useQuery({
    ...trpc.projects.getMany.queryOptions(),
    enabled: !!userId, // Выполнять запрос только если пользователь авторизован
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

  // Находим последний созданный элемент (самый новый по updatedAt)
  const latestProject = sortedProjects?.[0]

  const { setOpen, setOpenMobile, isMobile } = useSidebar()

  const handleCloseSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  // Фильтруем проекты, исключая последний (он будет показан в секции Latest)
  const otherProjects = sortedProjects?.slice(1) || []

  const generatingProjects =
    otherProjects?.filter((p) => p.status === 'PENDING' && p.sandboxId) || []

  const pendingChats =
    otherProjects?.filter((p) => p.status === 'PENDING' && !p.sandboxId) || []
  const completedProjects =
    otherProjects?.filter((p) => p.status === 'COMPLETED') || []
  const errorProjects = otherProjects?.filter((p) => p.status === 'ERROR') || []

  return (
    <Sidebar>
      <div className="p-4">
        <div className="flex flex-col items-start gap-4">
          {/* Home button - only icon on mobile, hidden on desktop */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent mb-4 h-8 w-8 md:hidden"
          >
            <Link href={'/'} onClick={handleCloseSidebar} scroll={false}>
              <Logo width={24} height={24} />
            </Link>
          </Button>

          {/* New Chat button - minimal Vercel style */}
          <Button
            asChild
            className="bg-foreground text-background hover:bg-foreground/90 h-8 flex-1 rounded-md text-sm font-medium"
          >
            <Link
              href={'/'}
              onClick={handleCloseSidebar}
              scroll={false}
              className="flex w-full items-center justify-center gap-1.5"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </Link>
          </Button>
        </div>
      </div>

      <SidebarContent className="p-2">
        {/* Latest - последний созданный элемент */}
        {latestProject && (
          <SidebarGroup>
            <CollapsibleGroupLabel
              icon={Clock}
              title="Latest"
              count={1}
              isCollapsed={collapsedGroups.latest}
              onToggle={() => toggleGroup('latest')}
            />
            {!collapsedGroups.latest && (
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/projects/${latestProject.id}`}
                      className="group relative h-10 rounded-lg transition-all duration-200 hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                    >
                      <Link
                        href={`/projects/${latestProject.id}`}
                        onClick={handleCloseSidebar}
                        scroll={false}
                        className="flex w-full items-center gap-3"
                      >
                        <ProjectName
                          project={{
                            name: latestProject.name,
                            status: latestProject.status,
                            updatedAt: latestProject.updatedAt,
                            sandboxId: latestProject.sandboxId,
                          }}
                        />
                        <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                          <ProjectMenu
                            projectId={latestProject.id}
                            currentName={latestProject.name || 'Untitled Chat'}
                          />
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Building Projects - только проекты с sandboxId */}
        {generatingProjects.length > 0 && (
          <SidebarGroup>
            <CollapsibleGroupLabel
              icon={Cog}
              title="Building Projects"
              count={generatingProjects.length}
              isCollapsed={collapsedGroups.generating}
              onToggle={() => toggleGroup('generating')}
            />
            {!collapsedGroups.generating && (
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
                        className="group relative h-10 rounded-lg transition-all duration-200 hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={handleCloseSidebar}
                          scroll={false}
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
            )}
          </SidebarGroup>
        )}

        {/* Project Chats - завершенные чаты */}
        <SidebarGroup>
          <CollapsibleGroupLabel
            icon={FolderOpen}
            title="Project Chats"
            count={completedProjects.length}
            isCollapsed={collapsedGroups.recent}
            onToggle={() => toggleGroup('recent')}
          />
          {!collapsedGroups.recent && (
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
                      className="group relative h-10 rounded-lg transition-all duration-200 hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        onClick={handleCloseSidebar}
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
          )}
        </SidebarGroup>

        {/* Text Chats - обычные чаты в ожидании */}
        {pendingChats.length > 0 && (
          <SidebarGroup>
            <CollapsibleGroupLabel
              icon={MessageSquare}
              title="Text Chats"
              count={pendingChats.length}
              isCollapsed={collapsedGroups.pending}
              onToggle={() => toggleGroup('pending')}
            />
            {!collapsedGroups.pending && (
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
                        className="group relative h-10 rounded-lg transition-all duration-200 hover:bg-black/5 data-[active=true]:bg-black/10 data-[active=true]:text-black dark:hover:bg-white/5 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white"
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={handleCloseSidebar}
                          scroll={false}
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
            )}
          </SidebarGroup>
        )}

        {/* Failed Projects */}
        {errorProjects.length > 0 && (
          <SidebarGroup>
            <CollapsibleGroupLabel
              icon={XCircle}
              title="Failed Projects"
              count={errorProjects.length}
              variant="error"
              isCollapsed={collapsedGroups.failed}
              onToggle={() => toggleGroup('failed')}
            />
            {!collapsedGroups.failed && (
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
                        className="group relative h-10 rounded-lg transition-all duration-200 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                      >
                        <Link
                          href={`/projects/${project.id}`}
                          onClick={handleCloseSidebar}
                          scroll={false}
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
            )}
          </SidebarGroup>
        )}

        {/* Quick Actions & Stats */}
        <div className="mt-auto space-y-3">
          {/* Stats */}
          <div className="rounded-lg border border-black/10 bg-black/2 p-3 dark:border-white/10 dark:bg-white/2">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Today
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {completedProjects.length +
                    (latestProject?.status === 'COMPLETED' ? 1 : 0)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Projects</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {pendingChats.length +
                    (latestProject?.status === 'PENDING' &&
                    !latestProject?.sandboxId
                      ? 1
                      : 0)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Text Chats
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black dark:text-white">
                  {generatingProjects.length +
                    (latestProject?.status === 'PENDING' &&
                    latestProject?.sandboxId
                      ? 1
                      : 0)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Building</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Link href="/profile/billing" scroll={false}>
                <CreditCard className="mr-2 h-3 w-3" />
                <span className="text-xs">Billing</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start text-gray-600 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Link href="/profile" scroll={false}>
                <User className="mr-2 h-3 w-3" />
                <span className="text-xs">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
