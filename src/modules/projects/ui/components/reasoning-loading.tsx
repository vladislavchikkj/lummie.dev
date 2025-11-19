'use client'

import { useProjectRealtimeStatus } from '@/modules/projects/hooks/useProjectRealtimeStatus'
import { ReasoningDisplay } from './reasoning-display'
import { BrainIcon } from 'lucide-react'

type ReasoningRealtimeProps = {
  projectId: string
  maxVisible?: number
}

export const ReasoningRealtime = ({
  projectId,
  maxVisible = 20,
}: ReasoningRealtimeProps) => {
  const { data, state, error } = useProjectRealtimeStatus(projectId)
  const isConnected = state === 'active'
  const isError = !!error

  // Limit visible messages if needed
  const visibleEvents = maxVisible
    ? data.slice(-maxVisible).map((msg) => msg.data)
    : data.map((msg) => msg.data)

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <span>Connection error: {error.message}</span>
      </div>
    )
  }

  if (isConnected && data.length === 0) {
    return (
      <div className="text-muted-foreground flex items-start gap-3 text-sm">
        <BrainIcon className="mt-0.5 size-4" />
        <span>Thinking...</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ReasoningDisplay events={visibleEvents} isStreaming={true} />
    </div>
  )
}
