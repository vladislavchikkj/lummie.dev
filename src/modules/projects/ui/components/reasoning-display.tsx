'use client'

import { cn } from '@/lib/utils'
import {
  Search,
  FileText,
  Wrench,
  CheckCircle2,
  Lightbulb,
  ChevronDownIcon,
  ChevronRightIcon,
  File,
  FolderEdit,
} from 'lucide-react'
import type { ReasoningEvent } from '@/inngest/types'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/shadcn-io/ai/reasoning'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { useEffect, useState, useRef, useCallback } from 'react'

interface ReasoningDisplayProps {
  events: ReasoningEvent[]
  className?: string
  isStreaming?: boolean
  isHistorical?: boolean
}

type GroupedEvent = {
  type: 'thinking' | 'action' | 'step'
  event: ReasoningEvent
  thinkingContent?: string
  stableKey: string
}

const ThinkingText = () => {
  return (
    <p className="relative inline-block">
      <span className="animate-shimmer bg-[linear-gradient(110deg,#64748b,45%,#e2e8f0,55%,#64748b)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#64748b,45%,#cbd5e1,55%,#64748b)]">
        Thinking...
      </span>
    </p>
  )
}

const ScrollingText = ({
  text,
  isComplete,
  onScrollComplete,
  autoScrollEnabled = true,
}: {
  text: string
  isComplete?: boolean
  onScrollComplete?: () => void
  autoScrollEnabled?: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  const hasCompletedScrollRef = useRef(false)
  const isCompleteRef = useRef(isComplete)

  useEffect(() => {
    isCompleteRef.current = isComplete
  }, [isComplete])

  useEffect(() => {
    if (!isComplete && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [text, isComplete])

  useEffect(() => {
    if (
      isComplete &&
      containerRef.current &&
      !hasCompletedScrollRef.current &&
      autoScrollEnabled
    ) {
      hasCompletedScrollRef.current = true
      const container = containerRef.current
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const isOverflowing = scrollHeight > clientHeight

      container.scrollTop = 0

      if (isOverflowing) {
        const startTime = performance.now()
        const scrollDuration = Math.min(3000, Math.max(1000, scrollHeight * 5))

        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / scrollDuration, 1)

          const easeProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2

          container.scrollTop = easeProgress * (scrollHeight - clientHeight)

          if (progress < 1) {
            scrollAnimationRef.current = requestAnimationFrame(animateScroll)
          } else {
            onScrollComplete?.()
          }
        }

        setTimeout(() => {
          scrollAnimationRef.current = requestAnimationFrame(animateScroll)
        }, 500)
      } else {
        setTimeout(() => {
          onScrollComplete?.()
        }, 1500)
      }
    } else if (
      isComplete &&
      !autoScrollEnabled &&
      !hasCompletedScrollRef.current
    ) {
      hasCompletedScrollRef.current = true
    }

    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [isComplete, onScrollComplete, autoScrollEnabled])

  return (
    <div
      ref={containerRef}
      className="text-muted-foreground scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30 max-h-[200px] overflow-y-auto whitespace-pre-wrap"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(100, 116, 139, 0.2) transparent',
      }}
    >
      {text}
    </div>
  )
}

const FilesList = ({ files }: { files: string[] }) => {
  if (!files || files.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {files.map((file, index) => (
        <span
          key={`${file}-${index}`}
          className="text-muted-foreground bg-muted/50 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
        >
          <File className="size-3" />
          <span className="max-w-[200px] truncate">{file}</span>
        </span>
      ))}
    </div>
  )
}

const isFileOperation = (event: ReasoningEvent): boolean => {
  const title = event.title.toLowerCase()
  const fileKeywords = [
    'creat',
    'save',
    'updat',
    'modif',
    'delet',
    'edit',
    'writ',
    'file',
  ]
  return (
    fileKeywords.some((keyword) => title.includes(keyword)) ||
    Boolean(event.metadata?.files && event.metadata.files.length > 0)
  )
}

export const ReasoningDisplay = ({
  events,
  className,
  isStreaming: _isStreaming = false,
  isHistorical = false,
}: ReasoningDisplayProps) => {
  void _isStreaming // Reserved for future use
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({})
  const closeTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const initializedThinkingRef = useRef(false)

  const isInProgress = (phase?: ReasoningEvent['phase']) => {
    if (isHistorical) return false
    return phase === 'started' || phase === 'in-progress'
  }

  const groupedEvents: GroupedEvent[] = []
  const thinkingStableKey = 'thinking-main'

  if (events && events.length > 0) {
    const usedIndices = new Set<number>()

    let mergedThinkingContent = ''
    let thinkingPhase: ReasoningEvent['phase'] = 'started'
    let thinkingDuration = 0
    let hasThinkingEvents = false

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      if (event.type === 'thinking') {
        hasThinkingEvents = true
        usedIndices.add(i)
        if (event.description) {
          mergedThinkingContent = event.description
        }
        if (event.phase === 'completed') {
          thinkingPhase = 'completed'
          thinkingDuration = event.duration || 0
        }
      }
    }

    if (hasThinkingEvents) {
      groupedEvents.push({
        type: 'thinking',
        event: {
          type: 'thinking',
          title: 'Thinking',
          phase: thinkingPhase,
          timestamp: Date.now(),
          duration: thinkingDuration,
          description: mergedThinkingContent,
        },
        thinkingContent: mergedThinkingContent,
        stableKey: thinkingStableKey,
      })
    }

    for (let i = 0; i < events.length; i++) {
      if (usedIndices.has(i)) continue
      const event = events[i]
      const key = `${event.type}-${event.timestamp}-${event.metadata?.operationId || event.title}`

      if (event.phase === 'started') {
        let matchedIndex = -1
        for (let j = i + 1; j < events.length; j++) {
          if (usedIndices.has(j)) continue
          const candidate = events[j]

          const isMatch =
            (event.type === 'action' || event.type === 'step') &&
            event.type === candidate.type &&
            candidate.phase === 'completed' &&
            ((event.metadata?.operationId &&
              candidate.metadata?.operationId &&
              event.metadata.operationId === candidate.metadata.operationId) ||
              (event.title === candidate.title && !event.metadata?.operationId))

          if (isMatch) {
            matchedIndex = j
            break
          }
        }

        if (matchedIndex !== -1) {
          usedIndices.add(matchedIndex)
          groupedEvents.push({
            type: event.type,
            event: events[matchedIndex],
            stableKey: key,
          })
          continue
        }
      }
      groupedEvents.push({ type: event.type, event, stableKey: key })
    }
  }

  useEffect(() => {
    const thinkingItem = groupedEvents.find((item) => item.type === 'thinking')

    if (thinkingItem) {
      const key = thinkingStableKey

      if (isHistorical) {
        setOpenStates((prev) => ({ ...prev, [key]: false }))
        return
      }

      if (!initializedThinkingRef.current) {
        setOpenStates((prev) => ({ ...prev, [key]: true }))
        initializedThinkingRef.current = true
      }

      if (isInProgress(thinkingItem.event.phase)) {
        if (closeTimersRef.current[key]) {
          clearTimeout(closeTimersRef.current[key])
          delete closeTimersRef.current[key]
        }
        setOpenStates((prev) => ({ ...prev, [key]: true }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- groupedEvents and isInProgress are derived from events/isHistorical
  }, [isHistorical, events.length])

  const handleScrollAnimationComplete = useCallback((stableKey: string) => {
    if (!closeTimersRef.current[stableKey]) {
      closeTimersRef.current[stableKey] = setTimeout(() => {
        setOpenStates((prev) => ({ ...prev, [stableKey]: false }))
        delete closeTimersRef.current[stableKey]
      }, 2000)
    }
  }, [])

  const handleManualOpenChange = (key: string, isOpen: boolean) => {
    setOpenStates((prev) => ({ ...prev, [key]: isOpen }))
    if (closeTimersRef.current[key]) {
      clearTimeout(closeTimersRef.current[key])
      delete closeTimersRef.current[key]
    }
  }

  if (!events || events.length === 0) {
    return null
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return '< 1s'
    if (duration < 1) return '< 1s'
    return `${Math.round(duration)}s`
  }

  const getActionIcon = (title: string, phase?: ReasoningEvent['phase']) => {
    const isCompleted = phase === 'completed'
    const isFailed = phase === 'failed'
    const isInProgress =
      phase === 'started' || phase === 'in-progress' || !phase

    const iconClass = cn(
      'size-4',
      isCompleted && 'text-foreground',
      isFailed && 'text-red-600 dark:text-red-400',
      isInProgress && 'text-muted-foreground'
    )

    if (
      title.toLowerCase().includes('check') ||
      title.toLowerCase().includes('read')
    )
      return <Search className={iconClass} />
    if (
      title.toLowerCase().includes('creat') ||
      title.toLowerCase().includes('save')
    )
      return <FileText className={iconClass} />
    if (
      title.toLowerCase().includes('review') ||
      title.toLowerCase().includes('build') ||
      title.toLowerCase().includes('work')
    ) {
      return isInProgress ? (
        <Loader size={16} className={iconClass} />
      ) : (
        <Wrench className={iconClass} />
      )
    }
    return isInProgress ? (
      <Loader size={16} className={iconClass} />
    ) : (
      <CheckCircle2 className={iconClass} />
    )
  }

  const fileOperations = groupedEvents.filter(
    (item) => item.type !== 'thinking' && isFileOperation(item.event)
  )
  const otherEvents = groupedEvents.filter(
    (item) => item.type === 'thinking' || !isFileOperation(item.event)
  )

  const fileOpsKey = 'file-operations-group'
  const isFileOpsOpen = openStates[fileOpsKey] ?? false
  const hasFileOperationsInProgress = fileOperations.some(({ event }) =>
    isInProgress(event.phase)
  )

  const renderActionItem = (item: GroupedEvent) => {
    const { event, stableKey } = item
    const icon = getActionIcon(event.title, event.phase)
    const duration = event.duration ? formatDuration(event.duration) : null
    const isCompleted = event.phase === 'completed'
    const isFailed = event.phase === 'failed'
    const loading = isInProgress(event.phase)

    return (
      <div key={stableKey} className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'text-[14px] leading-tight',
                isCompleted && 'text-foreground',
                isFailed && 'text-red-600 dark:text-red-400',
                loading && 'text-muted-foreground'
              )}
            >
              {event.title}
            </span>
            {duration && !loading && (
              <span className="text-muted-foreground/60 text-[12px]">
                {duration}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-muted-foreground/80 mt-1 text-[13px] leading-snug">
              {event.description}
            </p>
          )}
          {event.metadata?.files && <FilesList files={event.metadata.files} />}
        </div>
      </div>
    )
  }

  const renderThinkingItem = (item: GroupedEvent) => {
    const { event, thinkingContent, stableKey } = item
    const duration = event.duration || 0
    const isThinking = isInProgress(event.phase)
    const isComplete = event.phase === 'completed'

    const isOpen = openStates[stableKey] ?? false

    return (
      <Reasoning
        key={stableKey}
        isStreaming={false}
        open={isOpen}
        onOpenChange={(open) => handleManualOpenChange(stableKey, open)}
        duration={duration}
      >
        <ReasoningTrigger className="hover:text-foreground cursor-pointer transition-colors">
          <Lightbulb className="size-4" />
          {isThinking ? (
            <ThinkingText />
          ) : (
            <p>Thought for {formatDuration(duration)}</p>
          )}
          <ChevronDownIcon className="text-muted-foreground size-4 transition-transform" />
        </ReasoningTrigger>
        <ReasoningContent>
          <div className="relative pl-6">
            <div className="bg-border absolute top-0 bottom-0 left-2 w-px" />
            <ScrollingText
              text={thinkingContent || ''}
              isComplete={isComplete}
              autoScrollEnabled={!isHistorical}
              onScrollComplete={() => handleScrollAnimationComplete(stableKey)}
            />
          </div>
        </ReasoningContent>
      </Reasoning>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {otherEvents.map((item) => {
        if (item.type === 'thinking') return renderThinkingItem(item)
        return renderActionItem(item)
      })}

      {fileOperations.length > 0 && (
        <div className="flex flex-col">
          <button
            onClick={() =>
              setOpenStates((prev) => ({
                ...prev,
                [fileOpsKey]: !prev[fileOpsKey],
              }))
            }
            className="hover:text-foreground text-muted-foreground flex cursor-pointer items-center gap-2 text-[14px] transition-colors"
          >
            <FolderEdit className="size-4" />
            <span>
              {hasFileOperationsInProgress ? (
                <span className="animate-shimmer bg-[linear-gradient(110deg,#64748b,45%,#e2e8f0,55%,#64748b)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#64748b,45%,#cbd5e1,55%,#64748b)]">
                  Working with files...
                </span>
              ) : (
                `${fileOperations.length} file ${fileOperations.length === 1 ? 'operation' : 'operations'}`
              )}
            </span>
            {isFileOpsOpen ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </button>
          {isFileOpsOpen && (
            <div className="border-border mt-2 ml-2 flex flex-col gap-2 border-l pl-4">
              {fileOperations.map((item) => renderActionItem(item))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
