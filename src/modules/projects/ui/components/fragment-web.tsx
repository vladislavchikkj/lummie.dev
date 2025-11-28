'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Slash, TimerOff } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { Fragment } from '@/generated/prisma'
import { useTRPC } from '@/trpc/client'
import { PulsingLogo } from '@/components/ui/pulsing-logo'

const Spinner = () => (
  <div className="bg-background absolute inset-0 flex items-center justify-center">
    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
  </div>
)

// Skeleton блок с анимацией появления/исчезновения
const SkeletonBlock = ({
  width,
  color = 'default',
  delay,
  className,
}: {
  width: string
  color?: 'default' | 'accent' | 'muted' | 'highlight'
  delay: number
  className?: string
}) => {
  const colorClasses = {
    default: 'bg-muted-foreground/30',
    accent: 'bg-teal-500/50',
    muted: 'bg-muted-foreground/20',
    highlight: 'bg-blue-400/40',
  }

  return (
    <div
      className={cn('h-3 rounded-full', colorClasses[color], className)}
      style={{
        width,
        animation: `skeletonPulse 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  )
}

// Строка кода со skeleton блоками
const CodeSkeletonLine = ({
  blocks,
  indent = 0,
  delay,
}: {
  blocks: {
    width: string
    color?: 'default' | 'accent' | 'muted' | 'highlight'
  }[]
  indent?: number
  delay: number
}) => {
  return (
    <div
      className="flex h-6 items-center gap-2"
      style={{
        paddingLeft: `${indent * 16}px`,
        animation: `skeletonFadeIn 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {blocks.map((block, i) => (
        <SkeletonBlock
          key={i}
          width={block.width}
          color={block.color}
          delay={delay + i * 0.1}
        />
      ))}
    </div>
  )
}

// Конфигурация строк skeleton кода
const skeletonLines = [
  { blocks: [{ width: '50px' }, { width: '30px' }], indent: 0, delay: 0 },
  { blocks: [{ width: '40px' }], indent: 0, delay: 0.2 },
  { blocks: [], indent: 0, delay: 0 },
  {
    blocks: [
      { width: '60px' },
      { width: '45px', color: 'accent' as const },
      { width: '80px' },
      { width: '35px' },
    ],
    indent: 0,
    delay: 0.4,
  },
  {
    blocks: [
      { width: '70px', color: 'highlight' as const },
      { width: '90px', color: 'highlight' as const },
      { width: '55px', color: 'highlight' as const },
      { width: '40px' },
      { width: '100px', color: 'muted' as const },
    ],
    indent: 1,
    delay: 0.6,
  },
  {
    blocks: [
      { width: '45px' },
      { width: '75px', color: 'highlight' as const },
      { width: '60px', color: 'highlight' as const },
      { width: '50px' },
    ],
    indent: 2,
    delay: 0.8,
  },
  {
    blocks: [
      { width: '55px' },
      { width: '65px', color: 'highlight' as const },
      { width: '80px', color: 'muted' as const },
    ],
    indent: 2,
    delay: 1.0,
  },
  {
    blocks: [{ width: '40px' }, { width: '90px', color: 'muted' as const }],
    indent: 1,
    delay: 1.2,
  },
  { blocks: [{ width: '35px' }], indent: 0, delay: 1.4 },
]

// Список файлов для анимации
const generatingFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/globals.css',
  'components/Button.tsx',
  'components/Card.tsx',
  'lib/utils.ts',
  'tailwind.config.ts',
  'package.json',
]

const GeneratingState = () => {
  const [showWindow, setShowWindow] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowWindow(true), 200)
    return () => clearTimeout(timer)
  }, [])

  // Смена файлов каждые 2.5 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true)
      setTimeout(() => {
        setFileIndex((prev) => (prev + 1) % generatingFiles.length)
        setIsChanging(false)
      }, 200)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-background absolute inset-0 flex items-center justify-center overflow-hidden p-6">
      {/* CSS для анимаций */}
      <style jsx>{`
        @keyframes skeletonPulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scaleX(0.95);
          }
          50% {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        @keyframes skeletonFadeIn {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes cursorBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Editor window */}
      <div
        className={cn(
          'relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl',
          'transition-all duration-500',
          showWindow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {/* Window header */}
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 text-center">
            <span
              className={cn(
                'inline-block text-sm text-white/50 transition-all duration-200',
                isChanging
                  ? 'translate-y-2 opacity-0'
                  : 'translate-y-0 opacity-100'
              )}
            >
              {generatingFiles[fileIndex]}
            </span>
          </div>
          <div className="w-14" />
        </div>

        {/* Code content */}
        <div className="flex min-h-[280px] flex-col gap-1 p-6">
          {skeletonLines.map((line, i) => (
            <CodeSkeletonLine
              key={i}
              blocks={line.blocks}
              indent={line.indent}
              delay={line.delay}
            />
          ))}

          {/* Cursor line */}
          <div className="mt-2 flex h-6 items-center">
            <SkeletonBlock width="50px" color="muted" delay={1.6} />
            <div
              className="ml-1 h-4 w-0.5 bg-white/70"
              style={{
                animation: 'cursorBlink 1s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 border-t border-white/5 py-3">
          <PulsingLogo width={18} height={18} />
          <span className="text-xs text-white/40">Building your app...</span>
        </div>
      </div>
    </div>
  )
}

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
  data?: Fragment | null
  refreshKey: number
  isMobile?: boolean
  isGenerating?: boolean
}

type SandboxStatus = 'checking' | 'valid' | 'expired' | 'notFound'

export function FragmentWeb({
  data,
  refreshKey,
  isMobile = false,
  isGenerating = false,
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

    if (!data?.sandboxUrl) {
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
  }, [data?.sandboxUrl, refreshKey])

  // Обработчик загрузки iframe
  const handleIframeLoad = () => {
    setIsIframeLoading(false)

    // Ждем достаточно времени для полной загрузки контента iframe
    // Современные веб-приложения могут загружаться дольше
    setTimeout(() => {
      // Проверяем, что у нас есть URL и нет скриншота
      if (data?.sandboxUrl && !data.screenshot) {
        console.log('Generating screenshot for fragment:', data.id)
        generateScreenshotMutation.mutate({
          fragmentId: data.id,
          url: data.sandboxUrl,
        })
      }
    }, 2000)
  }

  // Показываем состояние генерации если идет генерация и нет готового URL
  if (isGenerating && !data?.sandboxUrl) {
    return (
      <div className="bg-background relative h-full w-full overflow-hidden">
        <GeneratingState />
      </div>
    )
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

  if (!data?.sandboxUrl) {
    return <ErrorState />
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
