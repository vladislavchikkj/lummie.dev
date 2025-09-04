import OpenAI from 'openai'
import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import {
  createChatInputSchema,
  GetManyInput,
  getManyInputSchema,
  sendMessageInputSchema,
} from '@/modules/chat/constants/types'
import {
  CHAT_MESSAGE_TYPES,
  CHAT_ROLES,
  ORDER_ASC,
  ORDER_DESC,
} from '@/modules/chat/constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const chatRouter = createTRPCRouter({
  createChat: protectedProcedure
    .input(createChatInputSchema)
    .mutation(async ({ input, ctx }) => {
      const chat = await prisma.chat.create({
        data: { userId: ctx.auth.userId || 'unknown' },
      })

      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          content: input.content,
          isFirst: true,
          role: CHAT_ROLES.USER,
          type: CHAT_MESSAGE_TYPES.TEXT,
        },
      })

      return { chatId: chat.id }
    }),

  getMany: protectedProcedure
    .input(getManyInputSchema)
    .query(async ({ input }: { input: GetManyInput }) => {
      return prisma.chatMessage.findMany({
        where: { chatId: input.chatId },
        orderBy: { createdAt: ORDER_ASC },
      })
    }),

  sendMessage: protectedProcedure
    .input(sendMessageInputSchema)
    .mutation(async function* ({ input, signal }) {
      try {
        if (!input.isFirst) {
          await prisma.chatMessage.create({
            data: {
              chatId: input.chatId,
              content: input.content,
              role: CHAT_ROLES.USER,
              type: CHAT_MESSAGE_TYPES.TEXT,
            },
          })
        }

        const history = await prisma.chatMessage.findMany({
          where: { chatId: input.chatId },
          orderBy: { createdAt: ORDER_DESC },
          take: 1,
        })

        const messagesForApi = history.map((msg) => {
          return {
            role: msg.role.toLowerCase() as 'user' | 'assistant',
            content: msg.content,
          }
        })

        let assistantContent = ''
        const stream = await openai.chat.completions.create(
          {
            model: 'gpt-4o-mini',
            messages: messagesForApi,
            stream: true,
          },
          {
            signal,
          }
        )

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || ''
          if (delta) {
            assistantContent += delta
            yield delta
          }
        }

        if (assistantContent) {
          await prisma.chatMessage.create({
            data: {
              chatId: input.chatId,
              content: assistantContent,
              role: CHAT_ROLES.ASSISTANT,
              type: CHAT_MESSAGE_TYPES.TEXT,
            },
          })
        }
        return
      } catch (error) {
        console.error('Streaming mutation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred while processing your message.',
        })
      }
    }),
})
