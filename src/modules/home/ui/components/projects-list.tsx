'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  Search,
  ImageIcon,
  MessageSquare,
  LayoutGrid,
  Loader2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTRPC } from '@/trpc/client'
import { ProjectMenu } from '@/modules/projects/ui/components/project-menu'
import Logo from '@/components/ui/logo'

interface FragmentPreview {
  id: string
  sandboxUrl: string
  title: string
  screenshot: string | null
}

// --- Components ---

const ProjectCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="aspect-[16/10] w-full rounded-xl" />
    <div className="flex items-center gap-3 px-1">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="w-full space-y-1.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  </div>
)

const EmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) => (
  <div className="bg-muted/20 animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center gap-y-4 rounded-xl border border-dashed px-4 py-10 text-center duration-500">
    <div className="bg-muted/50 ring-muted/20 flex h-16 w-16 items-center justify-center rounded-full ring-8">
      <Icon className="text-muted-foreground/60 h-8 w-8" />
    </div>
    <div className="max-w-xs space-y-1">
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  </div>
)

const ProjectStatusBadge = ({ status }: { status: string }) => {
  if (status === 'PENDING') {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating
      </Badge>
    )
  }
  if (status === 'ERROR') {
    return (
      <Badge
        variant="destructive"
        className="h-5 px-1.5 text-[10px] font-medium tracking-wider uppercase"
      >
        Error
      </Badge>
    )
  }
  return null
}

const ProjectName = ({
  project,
}: {
  project: { name: string | null; status: string }
}) => {
  const isPending = project.status === 'PENDING'

  if (isPending && !project.name) {
    return (
      <span className="text-muted-foreground animate-pulse font-medium">
        Creating project...
      </span>
    )
  }

  return (
    <span className="text-foreground group-hover:text-primary truncate font-medium transition-colors">
      {project.name || 'Untitled Project'}
    </span>
  )
}

export const ProjectsList = () => {
  const trpc = useTRPC()
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [visibleCount, setVisibleCount] = useState(9)
  const [activeTab, setActiveTab] = useState('projects')

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  const { data: allProjects, isLoading: isLoadingChats } = useQuery({
    ...trpc.projects.getMany.queryOptions(),
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

    const filtered = projects.filter((project) => {
      const hasFragment = !!project.latestFragment
      const matchesSearch = (project.name || 'Untitled Project')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      return hasFragment && matchesSearch
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case 'oldest':
        sorted.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        break
      case 'az':
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'za':
        sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'latest':
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }

    return sorted
  }, [projects, searchQuery, sortBy])

  const visibleProjects = filteredAndSortedProjects.slice(0, visibleCount)
  const hasMore = filteredAndSortedProjects.length > visibleCount

  // Filter chats: completed projects and pending chats (without sandboxId)
  const chats = useMemo(() => {
    if (!allProjects) return []
    return allProjects.filter(
      (p) =>
        p.status === 'COMPLETED' || (p.status === 'PENDING' && !p.sandboxId)
    )
  }, [allProjects])

  const filteredAndSortedChats = useMemo(() => {
    if (!chats) return []

    const filtered = chats.filter((chat) => {
      const matchesSearch = (chat.name || 'Untitled Chat')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case 'oldest':
        sorted.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        )
        break
      case 'az':
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'za':
        sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'latest':
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }

    return sorted
  }, [chats, searchQuery, sortBy])

  const visibleChats = filteredAndSortedChats.slice(0, visibleCount)
  const hasMoreChats = filteredAndSortedChats.length > visibleCount

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-y-8 px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:gap-1">
        <h2
          className="text-3xl font-bold tracking-tight"
          suppressHydrationWarning
        >
          {user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back'}
        </h2>
        <p className="text-muted-foreground text-sm">
          Your collection of AI-generated projects and assets.
        </p>
      </div>

      <Separator className="bg-border/60" />

      <Tabs
        defaultValue="projects"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          setVisibleCount(9) // Reset visible count when switching tabs
        }}
        className="w-full"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full overflow-x-auto lg:w-auto">
            <TabsList className="bg-muted/50 h-10 w-full min-w-fit justify-start rounded-lg p-1 lg:w-auto">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 px-3 text-sm data-[state=active]:shadow-sm sm:gap-2 sm:px-4"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">All Projects</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 px-3 text-sm data-[state=active]:shadow-sm sm:gap-2 sm:px-4"
              >
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span>Images</span>
              </TabsTrigger>
              <TabsTrigger
                value="chats"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 px-3 text-sm data-[state=active]:shadow-sm sm:gap-2 sm:px-4"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span>Chats</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={
                  activeTab === 'chats'
                    ? 'Filter chats...'
                    : activeTab === 'images'
                      ? 'Filter images...'
                      : 'Filter projects...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 border-muted-foreground/20 hover:border-muted-foreground/40 pl-9 transition-colors focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background/50 border-muted-foreground/20 hover:border-muted-foreground/40 w-full transition-colors sm:w-[160px]">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-3.5 w-3.5" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="latest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="az">Name (A-Z)</SelectItem>
                <SelectItem value="za">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent
          value="projects"
          className="animate-in slide-in-from-bottom-2 mt-8 min-h-[50vh] space-y-8 duration-500"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}

            {!isLoading && visibleProjects.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={LayoutGrid}
                  title="No projects found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'Projects generated from your prompts will appear here.'
                  }
                />
              </div>
            )}

            {visibleProjects.map((project) => {
              const previewFragment =
                project.latestFragment as FragmentPreview | null

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group relative flex flex-col gap-3 rounded-xl transition-all outline-none"
                >
                  {/* Card Image Area */}
                  <div className="bg-muted/30 group-hover:border-primary/20 group-focus-visible:ring-primary relative aspect-[16/10] w-full overflow-hidden rounded-xl border shadow-sm transition-all duration-300 group-hover:shadow-md group-focus-visible:ring-2">
                    {previewFragment?.screenshot ? (
                      <div className="h-full w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewFragment.screenshot}
                          alt={project.name || 'Preview'}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Subtle overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    ) : (
                      <div className="bg-muted/10 flex h-full w-full items-center justify-center">
                        {project.status === 'PENDING' ? (
                          <div className="flex flex-col items-center gap-2">
                            <Sparkles className="text-primary h-8 w-8 animate-pulse" />
                          </div>
                        ) : (
                          <Logo
                            width={40}
                            height={40}
                            className="text-muted-foreground/20"
                          />
                        )}
                      </div>
                    )}

                    {/* Status Badge Over Image */}
                    <div className="absolute top-3 right-3">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>

                  {/* Card Meta Area */}
                  <div className="flex items-start justify-between gap-3 px-1">
                    <div className="flex min-w-0 items-start gap-3">
                      {isMounted && user?.imageUrl ? (
                        <div className="ring-border relative mt-1 h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1">
                          <Image
                            src={user.imageUrl}
                            alt={user.fullName || 'User'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="bg-muted ring-border mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1">
                          <span className="text-muted-foreground text-[10px] font-medium">
                            {user?.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}

                      <div className="flex min-w-0 flex-col space-y-0.5">
                        <div className="flex items-center gap-2">
                          <ProjectName project={project} />
                        </div>
                        <p className="text-muted-foreground truncate text-xs">
                          {formatDistanceToNow(project.updatedAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Menu Trigger */}
                    <div
                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
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
            <div className="mt-12 flex justify-center pb-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="group gap-2 px-8"
              >
                Load more projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="mt-8">
          <EmptyState
            icon={ImageIcon}
            title="No generated images"
            description="Images generated from your prompts will appear here."
          />
        </TabsContent>

        <TabsContent
          value="chats"
          className="animate-in slide-in-from-bottom-2 mt-8 min-h-[50vh] space-y-8 duration-500"
        >
          <div className="flex flex-col gap-2">
            {isLoadingChats &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-background/50 flex items-center gap-3 rounded-lg border p-3"
                >
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}

            {!isLoadingChats && visibleChats.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={MessageSquare}
                  title="No chats found"
                  description={
                    searchQuery
                      ? `No results for "${searchQuery}"`
                      : 'Your conversation history will appear here.'
                  }
                />
              </div>
            )}

            {!isLoadingChats &&
              visibleChats.map((chat) => {
                return (
                  <Link
                    key={chat.id}
                    href={`/projects/${chat.id}`}
                    className="group bg-background/50 hover:border-primary/20 hover:bg-background focus-visible:ring-primary relative flex items-center gap-3 rounded-lg border p-3 transition-all outline-none hover:shadow-sm focus-visible:ring-2"
                  >
                    {/* Chat Icon */}
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                      <MessageSquare className="text-muted-foreground h-4 w-4" />
                    </div>

                    {/* Chat Info */}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                          {chat.name || 'Untitled Chat'}
                        </span>
                        <p className="text-muted-foreground truncate text-xs">
                          {formatDistanceToNow(chat.updatedAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Menu Trigger */}
                      <div
                        className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <ProjectMenu
                          projectId={chat.id}
                          currentName={chat.name || 'Untitled Chat'}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>

          {hasMoreChats && (
            <div className="mt-12 flex justify-center pb-8">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="group gap-2 px-8"
              >
                Load more chats
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
