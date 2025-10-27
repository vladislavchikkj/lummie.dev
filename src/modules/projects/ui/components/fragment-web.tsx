'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Slash, TimerOff } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { Fragment } from '@/generated/prisma'
import { useTRPC } from '@/trpc/client'

const Spinner = () => (
  <div className="bg-background absolute inset-0 flex items-center justify-center">
    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
  </div>
)

const ErrorState = () => (
  <div className="bg-muted/30 text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-4 text-sm">
    <div className="flex items-center gap-2">
      <Slash className="h-4 w-4" />
      <span>URL для предпросмотра не найден.</span>
    </div>
  </div>
)

const SandboxExpiredState = () => (
  <div className="bg-muted/30 text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-4 text-sm">
    <TimerOff className="h-10 w-10 text-gray-400" />
    <span className="text-base">The sandbox has expired.</span>
    <span className="text-xs">Please refresh or recreate it.</span>
  </div>
)

interface FragmentWebProps {
  data: Fragment
  refreshKey: number
  isMobile?: boolean
}

type SandboxStatus = 'checking' | 'valid' | 'expired' | 'notFound'

export function FragmentWeb({
  data,
  refreshKey,
  isMobile = false,
}: FragmentWebProps) {
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus>('checking')
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const generateScreenshotMutation = useMutation(
    trpc.projects.generateAndSaveScreenshot.mutationOptions({
      onSuccess: () => {
        // Инвалидируем кэш списка проектов чтобы обновить скриншоты
        queryClient.invalidateQueries(
          trpc.projects.getManyWithPreview.queryOptions()
        )
      },
    })
  )

  useEffect(() => {
    setSandboxStatus('checking')
    setIsIframeLoading(true)

    if (!data.sandboxUrl) {
      setSandboxStatus('notFound')
      return
    }

    let isCancelled = false
    const checker = new Image()

    checker.onload = () => {
      if (!isCancelled) {
        setSandboxStatus('valid')
      }
    }

    checker.onerror = () => {
      if (!isCancelled) {
        setSandboxStatus('expired')
      }
    }

    try {
      const url = new URL(data.sandboxUrl)
      url.pathname = '/favicon.ico'
      url.searchParams.set('t', Date.now().toString())
      checker.src = url.href
    } catch {
      setSandboxStatus('notFound')
    }

    return () => {
      isCancelled = true
      checker.onload = null
      checker.onerror = null
    }
  }, [data.sandboxUrl, refreshKey])

  // Обработчик загрузки iframe
  const handleIframeLoad = () => {
    setIsIframeLoading(false)

    // Ждем достаточно времени для полной загрузки контента iframe
    // Современные веб-приложения могут загружаться дольше
    setTimeout(() => {
      // Проверяем, что у нас есть URL и нет скриншота
      if (data.sandboxUrl && !data.screenshot) {
        console.log('Generating screenshot for fragment:', data.id)
        generateScreenshotMutation.mutate({
          fragmentId: data.id,
          url: data.sandboxUrl,
        })
      }
    }, 2000)
  }

  if (sandboxStatus === 'checking') {
    return <div className="bg-background h-full w-full" />
  }

  if (sandboxStatus === 'notFound') {
    return <ErrorState />
  }

  if (sandboxStatus === 'expired') {
    return <SandboxExpiredState />
  }

  return (
    <div className="bg-background relative h-full w-full overflow-hidden">
      {isIframeLoading && <Spinner />}

      <iframe
        ref={iframeRef}
        key={`${data.id}-${refreshKey}`}
        className={cn(
          'h-full w-full border-0 transition-opacity duration-300',
          isIframeLoading ? 'opacity-0' : 'opacity-100'
        )}
        src={data.sandboxUrl}
        title="Fragment Preview"
        sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
        onLoad={handleIframeLoad}
        onError={() => setSandboxStatus('expired')}
        style={{
          ...(isMobile && {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            minWidth: '100%',
          }),
        }}
      />
    </div>
  )
}
