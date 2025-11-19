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
import { useEffect, useState } from 'react'

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

const StreamingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
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
  if (!events || events.length === 0) {
    return null
  }

  const usedIndices = new Set<number>()
  const groupedEvents: GroupedEvent[] = []

  for (let i = 0; i < events.length; i++) {
    if (usedIndices.has(i)) continue

    const event = events[i]

    if (event.phase === 'started') {
      let matchedIndex = -1

      for (let j = i + 1; j < events.length; j++) {
        const candidate = events[j]

        if (
          event.type === 'thinking' &&
          candidate.type === 'thinking' &&
          candidate.phase === 'completed'
        ) {
          matchedIndex = j
          break
        }

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

  const formatDuration = (duration?: number) => {
    if (!duration || duration < 1) return '< 1s'
    return `${Math.round(duration)}s`
  }

  const isInProgress = (phase?: ReasoningEvent['phase']) => {
    if (isHistorical) return false

    return phase === 'started' || phase === 'in-progress'
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {groupedEvents.map((item, index) => {
        const { event, thinkingContent } = item

        if (item.type === 'thinking') {
          const duration = event.duration || 0
          const isThinking = isInProgress(event.phase)

          return (
            <Reasoning
              key={`thinking-${event.timestamp}-${index}`}
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
