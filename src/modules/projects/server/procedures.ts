import z from 'zod'
import { prisma } from '@/lib/db'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { consumeCredits } from '@/lib/usage'
import { OpenAI } from 'openai'
import { tools } from '@/modules/projects/tools'
import { CREATE_PROJECT_FN_NAME } from '@/modules/projects/constants'
import { availableFunctions } from '@/modules/projects/functions'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const projectsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'ID is required' }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProjects = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      })

      if (!existingProjects) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      }

      return existingProjects
    }),
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return projects
  }),
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Value is required' })
          .max(10000, { message: 'Value is too long' }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await consumeCredits()
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

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          status: 'PENDING',
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
              isFirst: true,
            },
          },
        },
      })

      return createdProject
    }),

  handleUserMessage: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
        value: z
          .string()
          .min(1, { message: 'Message is required' })
          .max(10000, { message: 'Message is too long' }),
        isFirst: z.boolean().optional(),
      })
    )
    .mutation(async function* ({ input, ctx, signal }) {
      try {
        console.log('Creating message with input: ============', input)
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
        const history = await prisma.message.findMany({
          where: {
            projectId: input.projectId,
            project: {
              userId: ctx.auth.userId,
            },
          },
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
            tools,
            tool_choice: 'auto',
          },
          {
            signal,
          }
        )

        let toolCallName = ''
        let toolCallArgs = ''

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta || ''
          const toolCallDelta = delta?.tool_calls?.[0]
          if (toolCallDelta) {
            if (toolCallDelta.function?.arguments) {
              toolCallArgs += toolCallDelta.function.arguments
            }
            if (toolCallDelta.function?.name) {
              toolCallName = toolCallDelta.function.name
            }
            yield { content: '', type: 'PROJECT' as 'CHAT' | 'PROJECT' }
          } else if (delta?.content) {
            assistantContent += delta.content
            yield { content: delta.content, type: 'CHAT' as 'CHAT' | 'PROJECT' }
          }

          if (chunk.choices[0]?.finish_reason === 'tool_calls') {
            if (
              toolCallName in availableFunctions &&
              toolCallName === CREATE_PROJECT_FN_NAME
            ) {
              const functionToCall = availableFunctions[toolCallName]
              await functionToCall({ input })
            }

            return
          }
        }

        if (assistantContent) {
          await prisma.project.update({
            where: { id: input.projectId, userId: ctx.auth.userId },
            data: {
              messages: {
                create: {
                  content: assistantContent,
                  role: 'ASSISTANT',
                  type: 'RESULT',
                },
              },
            },
          })
        }
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
