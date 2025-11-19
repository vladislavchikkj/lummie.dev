'use client'

import { useProjectRealtimeStatus } from '@/modules/projects/hooks/useProjectRealtimeStatus'
import { ReasoningDisplay } from './reasoning-display'
import { BrainIcon } from 'lucide-react'

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
  const { data, state, error } = useProjectRealtimeStatus(projectId)
  const isConnected = state === 'active'
  const isError = !!error

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
