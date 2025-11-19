'use client'

import { cn } from '@/lib/utils'
import {
  Search,
  FileText,
  Wrench,
  CheckCircle2,
  BrainIcon,
  ChevronDownIcon,
} from 'lucide-react'
import type { ReasoningEvent } from '@/inngest/types'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/shadcn-io/ai/reasoning'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { useEffect, useState } from 'react'

interface ReasoningDisplayProps {
  events: ReasoningEvent[]
  className?: string
  isStreaming?: boolean
  isHistorical?: boolean // Indicates data loaded from DB (not realtime)
}

type GroupedEvent = {
  type: 'thinking' | 'action' | 'step'
  event: ReasoningEvent
  thinkingContent?: string
}

// Animated "Thinking..." component with shimmer effect
const ThinkingText = () => {
  return (
    <p className="relative inline-block">
      <span className="animate-shimmer bg-[linear-gradient(110deg,#64748b,45%,#e2e8f0,55%,#64748b)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#64748b,45%,#cbd5e1,55%,#64748b)]">
        Thinking...
      </span>
    </p>
  )
}

// Streaming text effect component - shows typing animation
const StreamingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    // Start animation from the beginning
    setDisplayedText('')
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 10)

    return () => clearInterval(interval)
  }, [text])

  return (
    <div className="text-muted-foreground whitespace-pre-wrap">
      {displayedText}
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
  if (!events || events.length === 0) {
    return null
  }

  // Group events - merge started/completed pairs for both thinking and action events
  // First, identify which started events have matching completed events
  const usedIndices = new Set<number>()
  const groupedEvents: GroupedEvent[] = []

  for (let i = 0; i < events.length; i++) {
    if (usedIndices.has(i)) continue

    const event = events[i]

    // If this is a started event, look for matching completed event
    if (event.phase === 'started') {
      let matchedIndex = -1

      // Look for matching completed event in the rest of the array
      for (let j = i + 1; j < events.length; j++) {
        const candidate = events[j]

        // For thinking events - match by type
        if (
          event.type === 'thinking' &&
          candidate.type === 'thinking' &&
          candidate.phase === 'completed'
        ) {
          matchedIndex = j
          break
        }

        // For action/step events - match by type and title
        if (
          (event.type === 'action' || event.type === 'step') &&
          event.type === candidate.type &&
          event.title === candidate.title &&
          candidate.phase === 'completed'
        ) {
          matchedIndex = j
          break
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
          // For action/step, use completed event
          groupedEvents.push({
            type: event.type,
            event: completedEvent,
          })
        }
        continue
      }
    }

    // Single event without matching pair
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

    // Match icons based on title keywords
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

  const formatDuration = (duration?: number) => {
    if (!duration || duration < 1) return '< 1s'
    return `${Math.round(duration)}s`
  }

  const isInProgress = (phase?: ReasoningEvent['phase']) => {
    // Для исторических данных (из БД) - никогда не показываем как "в процессе"
    if (isHistorical) return false

    // Только события с явным статусом started/in-progress считаются активными
    // События без phase или с другими статусами считаются завершенными
    return phase === 'started' || phase === 'in-progress'
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {groupedEvents.map((item) => {
        const { event, thinkingContent } = item

        if (item.type === 'thinking') {
          const duration = event.duration || 0
          // Показываем анимацию только если событие реально в процессе (не завершено)
          const isThinking = isInProgress(event.phase)

          return (
            <Reasoning
              key={`thinking-${event.timestamp}`}
              isStreaming={isThinking}
              defaultOpen={isThinking}
              duration={duration}
            >
              <ReasoningTrigger>
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
                  {isThinking ? (
                    <StreamingText text={thinkingContent} />
                  ) : (
                    thinkingContent
                  )}
                </ReasoningContent>
              )}
            </Reasoning>
          )
        }

        // Action or Step events
        const icon = getActionIcon(event.title, event.phase)
        const duration = event.duration ? formatDuration(event.duration) : null
        const isCompleted = event.phase === 'completed'
        const isFailed = event.phase === 'failed'
        // Показываем анимацию только если событие реально в процессе (не завершено)
        const loading = isInProgress(event.phase)

        return (
          <div
            key={`${event.timestamp}-${event.title}`}
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

              {/* Показываем description для всех событий */}
              {event.description && (
                <>
                  {loading ? (
                    <div className="mt-1 text-[13px] leading-snug">
                      <StreamingText text={event.description} />
                    </div>
                  ) : (
                    <p
                      className={cn(
                        'text-muted-foreground/80 mt-1 text-[13px] leading-snug'
                      )}
                    >
                      {event.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
