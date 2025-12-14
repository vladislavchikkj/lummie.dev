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
      className="group hover:bg-accent/50 flex w-full items-start gap-3 px-3 py-2 text-left transition-colors first:pt-3 last:pb-3"
    >
      {/* Превью или иконка */}
      <div className="relative flex-shrink-0">
        {screenshot ? (
          <div className="bg-muted relative h-8 w-8 overflow-hidden rounded-md">
            <img
              src={screenshot}
              alt={name || 'Project preview'}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
            <Box className="text-muted-foreground h-3.5 w-3.5" />
          </div>
        )}
        <span className="bg-primary ring-background absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2" />
      </div>

      {/* Контент */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-foreground truncate text-sm leading-tight font-medium">
          {name || 'Untitled Project'}
        </p>
        <p className="text-muted-foreground text-xs leading-tight">
          Ready {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </p>
      </div>

      {/* Стрелка при ховере */}
      <span className="text-muted-foreground mt-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          <div className="border-border flex items-center justify-between border-b px-3 py-2.5">
            <p className="text-sm font-medium">Notifications</p>
            {unreadNotifications.length > 1 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2" />
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center px-4 text-center">
              <Bell className="text-muted-foreground/40 mb-2.5 h-5 w-5" />
              <p className="text-muted-foreground text-sm font-medium">
                No notifications
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[240px]">
              <div className="py-1">
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
          <div className="border-border flex items-center justify-between border-b px-3 py-2.5">
            <p className="text-sm font-medium">Notifications</p>
            {unreadNotifications.length > 1 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Список уведомлений */}
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2" />
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center px-4 text-center">
              <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-md">
                <Bell className="text-muted-foreground/50 h-4 w-4" />
              </div>
              <p className="text-foreground text-sm font-medium">
                No notifications yet
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                When your projects are ready, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[320px]">
              <div className="py-1">
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
