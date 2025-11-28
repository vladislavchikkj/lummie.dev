'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Box } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'

const STORAGE_KEY = 'lummie-read-notifications'

// Хук для работы с localStorage
function useReadNotifications() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setReadIds(new Set(parsed))
      }
    } catch (e) {
      console.error('Failed to load read notifications:', e)
    }
    setIsLoaded(true)
  }, [])

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)))
      } catch (e) {
        console.error('Failed to save read notifications:', e)
      }
      return newSet
    })
  }, [])

  const markAllAsRead = useCallback((ids: string[]) => {
    setReadIds((prev) => {
      const newSet = new Set(prev)
      ids.forEach((id) => newSet.add(id))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)))
      } catch (e) {
        console.error('Failed to save read notifications:', e)
      }
      return newSet
    })
  }, [])

  const isRead = useCallback((id: string) => readIds.has(id), [readIds])

  return { readIds, markAsRead, markAllAsRead, isRead, isLoaded }
}

interface NotificationItemProps {
  id: string
  name: string | null
  updatedAt: Date
  screenshot: string | null
  onNavigate: (projectId: string) => void
}

const NotificationItem = ({
  id,
  name,
  updatedAt,
  screenshot,
  onNavigate,
}: NotificationItemProps) => {
  return (
    <button
      onClick={() => onNavigate(id)}
      className="group border-border/50 hover:bg-muted/50 flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-0"
    >
      {/* Превью или иконка */}
      <div className="relative flex-shrink-0">
        {screenshot ? (
          <div className="border-border bg-background relative h-9 w-9 overflow-hidden rounded border">
            <img
              src={screenshot}
              alt={name || 'Project preview'}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="border-border bg-background flex h-9 w-9 items-center justify-center rounded border">
            <Box className="text-muted-foreground h-4 w-4" />
          </div>
        )}
        <span className="bg-foreground absolute top-1/2 -left-1.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
      </div>

      {/* Контент */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">
          {name || 'Untitled Project'}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Ready {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Стрелка при ховере */}
      <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </button>
  )
}

// Хук для использования в других компонентах
export function useNotifications() {
  const { userId } = useAuth()
  const trpc = useTRPC()
  const { markAsRead, markAllAsRead, isRead, isLoaded } = useReadNotifications()

  // Получаем все проекты чтобы знать есть ли PENDING
  const { data: allProjects } = useQuery({
    ...trpc.projects.getMany.queryOptions(),
    enabled: !!userId,
    staleTime: 10000,
  })

  // Проверяем есть ли проекты в процессе генерации
  const hasPendingProjects = allProjects?.some((p) => p.status === 'PENDING')

  const { data: notifications = [], isLoading } = useQuery({
    ...trpc.projects.getRecentlyCompleted.queryOptions(),
    enabled: !!userId,
    // Если есть PENDING проекты - обновляем каждые 3 секунды, иначе каждые 30 секунд
    refetchInterval: hasPendingProjects ? 3000 : 30000,
    staleTime: hasPendingProjects ? 1000 : 15000,
  })

  const unreadCount = isLoaded
    ? notifications.filter((n) => !isRead(n.id)).length
    : 0

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isRead,
    isLoaded,
  }
}

interface NotificationsPopoverProps {
  mobile?: boolean
}

export const NotificationsPopover = ({ mobile }: NotificationsPopoverProps) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isRead,
  } = useNotifications()

  // Показываем только непрочитанные уведомления
  const unreadNotifications = notifications.filter((n) => !isRead(n.id))

  const handleMarkAllAsRead = () => {
    markAllAsRead(notifications.map((n) => n.id))
  }

  // Навигация к проекту — сначала закрываем popover, потом отмечаем как прочитанное, потом навигируем
  const handleNavigate = useCallback(
    (projectId: string) => {
      setIsOpen(false)
      markAsRead(projectId)
      // Небольшая задержка чтобы popover успел закрыться
      setTimeout(() => {
        router.push(`/projects/${projectId}`)
      }, 50)
    },
    [markAsRead, router]
  )

  // Мобильная версия
  if (mobile) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-md"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="bg-foreground text-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="border-border bg-background w-72 overflow-hidden rounded-lg border p-0 shadow-lg"
        >
          <div className="border-border flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-sm font-medium">Notifications</p>
            {unreadNotifications.length > 1 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="flex h-[140px] items-center justify-center">
              <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2" />
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="flex h-[140px] flex-col items-center justify-center px-4 text-center">
              <Bell className="text-muted-foreground/50 mb-2 h-5 w-5" />
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[240px]">
              <div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    name={notification.name}
                    updatedAt={notification.updatedAt}
                    screenshot={notification.screenshot}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="hidden md:block">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted relative rounded-md"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Индикатор непрочитанных */}
            {unreadCount > 0 && (
              <span className="bg-foreground text-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="border-border bg-background w-80 overflow-hidden rounded-lg border p-0 shadow-lg"
        >
          {/* Заголовок */}
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unreadNotifications.length > 1 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Список уведомлений */}
          {isLoading ? (
            <div className="flex h-[180px] items-center justify-center">
              <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2" />
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="flex h-[180px] flex-col items-center justify-center px-4 text-center">
              <div className="border-border mb-3 flex h-10 w-10 items-center justify-center rounded-full border">
                <Bell className="text-muted-foreground/50 h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-sm">
                No notifications yet
              </p>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                When your projects are ready, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[280px]">
              <div>
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    name={notification.name}
                    updatedAt={notification.updatedAt}
                    screenshot={notification.screenshot}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
