import { Realtime, channel, topic } from '@inngest/realtime'
import z from 'zod'

export const PROJECT_CHANNEL_TOPIC = 'status'

export type ProjectChannelToken = Realtime.Token<typeof projectChannel, ['status']>;
export const projectChannel = channel((projectId: string) => `project:${projectId}`)
  .addTopic(
    topic(PROJECT_CHANNEL_TOPIC).schema(
      z.object({
        functionId: z.string(),
        phase: z.enum(['started', 'in-progress', 'completed', 'failed']),
        message: z.string()
        // timestamp: z.string().optional(), if needed to calc duration
      }),
    ),
  )