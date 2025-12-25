import { prisma } from '@/lib/db'
import { consumeCredits } from '@/lib/usage'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import z from 'zod'

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId,
          },
        },
        include: {
          fragment: true,
          generatedImage: true
        },
        orderBy: {
          updatedAt: 'asc',
        },
      })

      return messages
    }),
  handleUserMessage: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
        projectId: z.string().min(1, { message: 'Project ID is required' }),
        isFirst: z.boolean().optional(),
      })
    )
    .mutation(async function* ({ input, ctx }) {
      try {
        if (!input.isFirst) {
          await consumeCredits()
          await prisma.project.update({
            where: { id: input.projectId, userId: ctx.auth.userId },
            data: {
              messages: {
                create: { content: input.value, role: 'USER', type: 'RESULT' },
              },
            },
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Something went wrong',
          })
        } else {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'You have run out of credits',
          })
        }
      }

      try {
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
