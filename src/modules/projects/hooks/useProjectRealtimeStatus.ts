'use client'

import {
  InngestSubscriptionState,
  useInngestSubscription,
} from '@inngest/realtime/hooks'
import { useTRPCClient } from '@/trpc/client'
import { ProjectChannelToken } from '@/inngest/channels'
import type { ReasoningEvent } from '@/inngest/types'

type RealtimeMessage = {
  channel: string
  topic: string
  data: ReasoningEvent
}

type UseProjectRealtimeReturn = {
  data: RealtimeMessage[]
  error: Error | null
  freshData: RealtimeMessage[]
  latestData: RealtimeMessage | null
  state: InngestSubscriptionState
}

export function useProjectRealtimeStatus(
  projectId: string
): UseProjectRealtimeReturn {
  const trpcClient = useTRPCClient()
  const refreshToken = async (): Promise<ProjectChannelToken | null> => {
    try {
      const result = await trpcClient.projects.getSubscribeToken.query({
        projectId,
      })
      return result ?? null
    } catch (err) {
      console.error('[useProjectRealtime] Failed to fetch token:', err)
      return null
    }
  }

  const subscription = useInngestSubscription({
    refreshToken,
  })

  const { data, error, freshData, state, latestData } = subscription

  return {
    data: data,
    error,
    freshData: freshData ?? [],
    latestData,
    state,
  }
}
