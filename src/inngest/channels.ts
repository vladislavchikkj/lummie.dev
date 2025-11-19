import { Realtime, channel, topic } from '@inngest/realtime'
import z from 'zod'

export const PROJECT_CHANNEL_TOPIC = 'status'

export type ProjectChannelToken = Realtime.Token<
  typeof projectChannel,
  ['status']
>
export const projectChannel = channel(
  (projectId: string) => `project:${projectId}`
).addTopic(
  topic(PROJECT_CHANNEL_TOPIC).schema(
    z.object({
      type: z.enum(['thinking', 'action', 'step']),
      phase: z
        .enum(['started', 'in-progress', 'completed', 'failed'])
        .optional(),
      title: z.string(),
      description: z.string().optional(),
      duration: z.number().optional(), // Duration in seconds
      timestamp: z.number(),
      metadata: z.record(z.any()).optional(),
    })
  )
)
