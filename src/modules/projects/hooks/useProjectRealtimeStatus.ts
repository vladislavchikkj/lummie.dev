"use client";

import { InngestSubscriptionState, useInngestSubscription } from '@inngest/realtime/hooks'
import { useTRPCClient } from '@/trpc/client'
import { ProjectChannelToken } from '@/inngest/channels'

type RealtimeMessage = {
  channel: string;
  topic: string;
  data: {
    functionId: string;
    phase: "started" | "in-progress" | "completed" | "failed";
    step?: string;
    message: string;
  };
};

type UseProjectRealtimeReturn = {
  data: RealtimeMessage[];
  error: Error | null;
  freshData: RealtimeMessage[];
  latestData: RealtimeMessage | null;
  state: InngestSubscriptionState;
};

export function useProjectRealtimeStatus(projectId: string): UseProjectRealtimeReturn {
  const trpcClient = useTRPCClient()
  const refreshToken = async (): Promise<ProjectChannelToken | null> => {
    try {
      const result = await trpcClient.projects.getSubscribeToken.query({ projectId });
      return result ?? null;
    } catch (err) {
      console.error("[useProjectRealtime] Failed to fetch token:", err);
      return null;
    }
  };

  const subscription = useInngestSubscription({
    refreshToken,
  });

  const { data, error, freshData, state, latestData } = subscription;

  return {
    data: data ,
    error,
    freshData: freshData ?? [],
    latestData,
    state,
  };
}