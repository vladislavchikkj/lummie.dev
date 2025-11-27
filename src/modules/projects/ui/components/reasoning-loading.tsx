'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useProjectRealtimeStatus } from '@/modules/projects/hooks/useProjectRealtimeStatus'
import { ReasoningDisplay } from './reasoning-display'
import { BrainIcon } from 'lucide-react'
import { useTRPC } from '@/trpc/client'
import type { ReasoningEvent } from '@/inngest/types'

type ReasoningRealtimeProps = {
  projectId: string
  maxVisible?: number
  isGenerating?: boolean
}

export const ReasoningRealtime = ({
  projectId,
  maxVisible = 20,
  isGenerating = true,
}: ReasoningRealtimeProps) => {
  const trpc = useTRPC()
  const { data, state, error } = useProjectRealtimeStatus(projectId)
  const isConnected = state === 'active'
  const isError = !!error

  // Загружаем сохранённые шаги из БД при монтировании
  const { data: savedSteps } = useQuery({
    ...trpc.projects.getCurrentReasoningSteps.queryOptions({ projectId }),
    staleTime: 5000,
    refetchInterval: false,
  })

  // Объединяем сохранённые шаги с realtime шагами
  const combinedEvents = useMemo(() => {
    const realtimeEvents = data.map((msg) => msg.data)
    const initialSteps = (savedSteps?.steps || []) as ReasoningEvent[]

    if (realtimeEvents.length === 0) {
      // Если нет realtime событий, показываем сохранённые
      return initialSteps
    }

    // Если есть realtime события, объединяем уникальные по timestamp
    const allEvents = [...initialSteps]
    const existingTimestamps = new Set(allEvents.map((e) => e.timestamp))

    for (const event of realtimeEvents) {
      if (!existingTimestamps.has(event.timestamp)) {
        allEvents.push(event)
        existingTimestamps.add(event.timestamp)
      }
    }

    // Сортируем по timestamp
    return allEvents.sort((a, b) => a.timestamp - b.timestamp)
  }, [data, savedSteps?.steps])

  const visibleEvents = maxVisible
    ? combinedEvents.slice(-maxVisible)
    : combinedEvents

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <span>Connection error: {error.message}</span>
      </div>
    )
  }

  if (isConnected && combinedEvents.length === 0) {
    return (
      <div className="flex items-start gap-3 text-sm">
        <BrainIcon className="text-muted-foreground mt-0.5 size-4" />
        <span className="animate-shimmer bg-[linear-gradient(110deg,#64748b,45%,#e2e8f0,55%,#64748b)] bg-[length:200%_100%] bg-clip-text text-transparent dark:bg-[linear-gradient(110deg,#64748b,45%,#cbd5e1,55%,#64748b)]">
          Thinking...
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ReasoningDisplay events={visibleEvents} isStreaming={isGenerating} />
    </div>
  )
}
