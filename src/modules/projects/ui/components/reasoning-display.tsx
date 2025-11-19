'use client'

import { cn } from '@/lib/utils'
import { 
  Search, 
  FileText, 
  Wrench, 
  CheckCircle2,
  BrainIcon,
  ChevronDownIcon
} from 'lucide-react'
import type { ReasoningEvent } from '@/inngest/types'
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '@/components/ui/shadcn-io/ai/reasoning'
import { Loader } from '@/components/ui/shadcn-io/ai/loader'

interface ReasoningDisplayProps {
  events: ReasoningEvent[]
  className?: string
  isStreaming?: boolean
}

type GroupedEvent = {
  type: 'thinking' | 'action' | 'step'
  event: ReasoningEvent
  thinkingContent?: string
}

export const ReasoningDisplay = ({ 
  events, 
  className,
  isStreaming = false 
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
        if (event.type === 'thinking' && 
            candidate.type === 'thinking' && 
            candidate.phase === 'completed') {
          matchedIndex = j
          break
        }
        
        // For action/step events - match by type and title
        if ((event.type === 'action' || event.type === 'step') &&
            event.type === candidate.type &&
            event.title === candidate.title &&
            candidate.phase === 'completed') {
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
            thinkingContent: event.description
          })
        } else {
          // For action/step, use completed event
          groupedEvents.push({
            type: event.type,
            event: completedEvent
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
        thinkingContent: event.description
      })
    } else {
      groupedEvents.push({
        type: event.type,
        event
      })
    }
  }

  const getActionIcon = (title: string, phase?: ReasoningEvent['phase']) => {
    const isCompleted = phase === 'completed'
    const isFailed = phase === 'failed'
    const isInProgress = phase === 'started' || phase === 'in-progress' || !phase
    
    const iconClass = cn(
      'size-4',
      isCompleted && 'text-foreground',
      isFailed && 'text-red-600 dark:text-red-400',
      isInProgress && 'text-muted-foreground'
    )

    // Match icons based on title keywords
    if (title.toLowerCase().includes('check') || title.toLowerCase().includes('read')) {
      return <Search className={iconClass} />
    }
    if (title.toLowerCase().includes('creat') || title.toLowerCase().includes('save')) {
      return <FileText className={iconClass} />
    }
    if (title.toLowerCase().includes('review') || title.toLowerCase().includes('build') || title.toLowerCase().includes('work')) {
      return isInProgress ? <Loader size={16} className={iconClass} /> : <Wrench className={iconClass} />
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
    return phase === 'started' || phase === 'in-progress' || !phase
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {groupedEvents.map((item, index) => {
        const { event, thinkingContent } = item
        const isLast = index === groupedEvents.length - 1
        const showAsStreaming = isStreaming && isLast

        if (item.type === 'thinking') {
          const duration = event.duration || 0
          const isThinking = isInProgress(event.phase) || showAsStreaming

          return (
            <Reasoning 
              key={`${event.timestamp}-${index}`}
              isStreaming={isThinking}
              defaultOpen={isThinking}
              duration={duration}
            >
              <ReasoningTrigger>
                <BrainIcon className="size-4" />
                {isThinking ? (
                  <p>Thinking...</p>
                ) : (
                  <p>Thought for {formatDuration(duration)}</p>
                )}
                <ChevronDownIcon className="text-muted-foreground size-4 transition-transform" />
              </ReasoningTrigger>
              {thinkingContent && (
                <ReasoningContent>
                  {thinkingContent}
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
        const loading = isInProgress(event.phase) || showAsStreaming

        return (
          <div
            key={`${event.timestamp}-${index}`}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 shrink-0">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
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
                  <span className="text-[12px] text-muted-foreground/60">
                    {duration}
                  </span>
                )}
              </div>
              
              {/* Показываем description только для событий в процессе выполнения */}
              {event.description && loading && (
                <p className={cn(
                  "text-[13px] text-muted-foreground/80 mt-1 leading-snug"
                )}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

