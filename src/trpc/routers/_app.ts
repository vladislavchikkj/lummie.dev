import { usageRouter } from '@/modules/usage/server/procedures'
import { messagesRouter } from '@/modules/messages/server/procedures'
import { projectsRouter } from '@/modules/projects/server/procedures'
import { chatRouter } from '@/modules/chat/server/procedures'

import { createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  usage: usageRouter,
  messages: messagesRouter,
  projects: projectsRouter,
  chat: chatRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
