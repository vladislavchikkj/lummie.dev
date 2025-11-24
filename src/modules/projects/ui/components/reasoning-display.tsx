'use client'

import { cn } from '@/lib/utils'
import {
  Search,
  FileText,
  Wrench,
  CheckCircle2,
  BrainIcon,
  ChevronDownIcon,
  File,
} from 'lucide-react'
import type { ReasoningEvent } from '@/inngest/types'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/shadcn-io/ai/reasoning'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { useEffect, useState, useRef } from 'react'

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

const ScrollingText = ({ text }: { text: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when text changes
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [text])

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

export const ReasoningDisplay = ({
  events,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isStreaming = false,
  isHistorical = false,
}: ReasoningDisplayProps) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({})
  const closeTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const processedCompletedRef = useRef<Set<string>>(new Set())

  const isInProgress = (phase?: ReasoningEvent['phase']) => {
    if (isHistorical) return false
    return phase === 'started' || phase === 'in-progress'
  }

  // Group events before early return
  const groupedEvents: GroupedEvent[] = []

  if (events && events.length > 0) {
    const usedIndices = new Set<number>()

    for (let i = 0; i < events.length; i++) {
      if (usedIndices.has(i)) continue

      const event = events[i]

      if (event.phase === 'started') {
        let matchedIndex = -1

        for (let j = i + 1; j < events.length; j++) {
          const candidate = events[j]

          // Match thinking events
          if (
            event.type === 'thinking' &&
            candidate.type === 'thinking' &&
            candidate.phase === 'completed'
          ) {
            matchedIndex = j
            break
          }

          // Match action/step events by operationId if available
          if (
            (event.type === 'action' || event.type === 'step') &&
            event.type === candidate.type &&
            candidate.phase === 'completed'
          ) {
            // First try to match by operationId
            if (
              event.metadata?.operationId &&
              candidate.metadata?.operationId &&
              event.metadata.operationId === candidate.metadata.operationId
            ) {
              matchedIndex = j
              break
            }
            // Fallback to title matching
            if (
              event.title === candidate.title &&
              !event.metadata?.operationId
            ) {
              matchedIndex = j
              break
            }
          }
        }

        if (matchedIndex !== -1) {
          const completedEvent = events[matchedIndex]
          usedIndices.add(matchedIndex)

          if (event.type === 'thinking') {
            groupedEvents.push({
              type: 'thinking',
              event: {
                ...completedEvent,
                description: event.description,
              },
              thinkingContent: event.description,
            })
          } else {
            groupedEvents.push({
              type: event.type,
              event: completedEvent,
            })
          }
          continue
        }
      }

      if (event.type === 'thinking') {
        groupedEvents.push({
          type: 'thinking',
          event,
          thinkingContent: event.description,
        })
      } else {
        groupedEvents.push({
          type: event.type,
          event,
        })
      }
    }
  }

  // Effect to manage thinking items - open them and auto-close after completion
  useEffect(() => {
    groupedEvents.forEach((item, index) => {
      if (item.type === 'thinking') {
        const key = `thinking-${item.event.timestamp}-${index}`
        const isThinking = isInProgress(item.event.phase)
        const wasCompleted = item.event.phase === 'completed'

        console.log('Processing thinking event:', {
          key,
          phase: item.event.phase,
          isThinking,
          wasCompleted,
          isHistorical,
          alreadyProcessed: processedCompletedRef.current.has(key),
          currentState: openStates[key],
        })

        // Open thinking items that are in progress
        if (isThinking) {
          console.log('Opening thinking (in progress):', key)
          setOpenStates((prev) => {
            if (prev[key]) return prev
            return { ...prev, [key]: true }
          })

          // Clear any existing close timer
          if (closeTimersRef.current[key]) {
            clearTimeout(closeTimersRef.current[key])
            delete closeTimersRef.current[key]
          }
        }

        // When thinking completes, keep it open briefly then auto-close
        // BUT only if we haven't processed this completion before
        // Skip auto-close for historical data - user can manually control
        if (
          wasCompleted &&
          !isHistorical &&
          !processedCompletedRef.current.has(key)
        ) {
          console.log('Thinking completed, scheduling auto-close:', key)
          // Mark as processed immediately to prevent reopening
          processedCompletedRef.current.add(key)

          setOpenStates((prev) => {
            if (prev[key]) return prev
            return { ...prev, [key]: true }
          })

          // Schedule auto-close after 5 seconds if not already scheduled
          if (!closeTimersRef.current[key]) {
            closeTimersRef.current[key] = setTimeout(() => {
              console.log('Auto-closing thinking:', key)
              setOpenStates((prev) => ({ ...prev, [key]: false }))
              delete closeTimersRef.current[key]
            }, 5000)
          }
        }

        // For historical data, ensure it starts closed but remains interactive
        if (
          wasCompleted &&
          isHistorical &&
          !processedCompletedRef.current.has(key)
        ) {
          console.log('Historical thinking, starting closed:', key)
          processedCompletedRef.current.add(key)
          setOpenStates((prev) => {
            if (key in prev) return prev
            return { ...prev, [key]: false }
          })
        }
      }
    })

    // Cleanup timers on unmount
    return () => {
      Object.values(closeTimersRef.current).forEach(clearTimeout)
      closeTimersRef.current = {}
    }
    // groupedEvents changes on every render, so we use events as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isHistorical])

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
    ) {
      return <Search className={iconClass} />
    }
    if (
      title.toLowerCase().includes('creat') ||
      title.toLowerCase().includes('save')
    ) {
      return <FileText className={iconClass} />
    }
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

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {groupedEvents.map((item, index) => {
        const { event, thinkingContent } = item

        if (item.type === 'thinking') {
          const duration = event.duration || 0
          const isThinking = isInProgress(event.phase)
          const key = `thinking-${event.timestamp}-${index}`
          // Use explicit state value or default to thinking state
          const isOpen = key in openStates ? openStates[key] : isThinking

          return (
            <Reasoning
              key={key}
              isStreaming={false}
              open={isOpen}
              onOpenChange={(open) => {
                console.log('ReasoningDisplay: onOpenChange called', {
                  key,
                  open,
                  wasOpen: isOpen,
                })
                // Always allow user to control the state
                setOpenStates((prev) => ({ ...prev, [key]: open }))
                // Cancel auto-close timer if user manually interacts
                if (closeTimersRef.current[key]) {
                  clearTimeout(closeTimersRef.current[key])
                  delete closeTimersRef.current[key]
                }
              }}
              duration={duration}
              disabled={false}
            >
              <ReasoningTrigger
                className="hover:text-foreground cursor-pointer transition-colors"
                disabled={false}
              >
                <BrainIcon className="size-4" />
                {isThinking ? (
                  <ThinkingText />
                ) : (
                  <p>Thought for {formatDuration(duration)}</p>
                )}
                <ChevronDownIcon className="text-muted-foreground size-4 transition-transform" />
              </ReasoningTrigger>
              {thinkingContent && (
                <ReasoningContent>
                  <div className="relative pl-6">
                    <div className="bg-border absolute top-0 bottom-0 left-2 w-px" />
                    {isThinking && !isHistorical ? (
                      <ScrollingText text={thinkingContent} />
                    ) : (
                      <div
                        className="text-muted-foreground scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30 max-h-[200px] overflow-y-auto whitespace-pre-wrap"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor:
                            'rgba(100, 116, 139, 0.2) transparent',
                        }}
                      >
                        {thinkingContent}
                      </div>
                    )}
                  </div>
                </ReasoningContent>
              )}
            </Reasoning>
          )
        }

        const icon = getActionIcon(event.title, event.phase)
        const duration = event.duration ? formatDuration(event.duration) : null
        const isCompleted = event.phase === 'completed'
        const isFailed = event.phase === 'failed'
        const loading = isInProgress(event.phase)

        return (
          <div
            key={`action-${event.timestamp}-${event.title}-${index}`}
            className="flex items-start gap-3"
          >
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
                <p
                  className={cn(
                    'text-muted-foreground/80 mt-1 text-[13px] leading-snug'
                  )}
                >
                  {event.description}
                </p>
              )}

              {event.metadata?.files && (
                <FilesList files={event.metadata.files} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
