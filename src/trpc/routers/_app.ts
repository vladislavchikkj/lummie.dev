import { usageRouter } from '@/modules/usage/server/procedures'
import { messagesRouter } from '@/modules/messages/server/procedures'
import { projectsRouter } from '@/modules/projects/server/procedures'
import { subscriptionRouter } from '@/modules/subscriptions/server/procedures'

import { createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messagesRouter,
  projects: projectsRouter,
  subscriptions: subscriptionRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
