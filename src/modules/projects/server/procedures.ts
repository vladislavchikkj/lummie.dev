import z from 'zod'
import { prisma } from '@/lib/db'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { TRPCError } from '@trpc/server'
import { consumeCredits } from '@/lib/usage'
import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { tools } from '@/modules/projects/tools'
import { CREATE_PROJECT_FN_NAME } from '@/modules/projects/constants'
import { availableFunctions } from '@/modules/projects/functions'
import { generateChatName } from '@/lib/chat-name-generator'
import { CHAT_SYSTEM_PROMPT } from '@/prompt'
import puppeteer from 'puppeteer'
import { getSubscriptionToken } from '@inngest/realtime'
import { inngest } from '@/inngest/client'
import { PROJECT_CHANNEL_TOPIC, projectChannel, ProjectChannelToken } from '@/inngest/channels'

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
  
  // Получение недавно завершённых проектов для уведомлений
  getRecentlyCompleted: protectedProcedure.query(async ({ ctx }) => {
    // Получаем проекты завершённые за последние 24 часа
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // Максимум 10 уведомлений
      include: {
        messages: {
          where: {
            fragment: {
              isNot: null,
            },
          },
          include: {
            fragment: {
              select: {
                id: true,
                title: true,
                screenshot: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      updatedAt: project.updatedAt,
      screenshot: project.messages[0]?.fragment?.screenshot || null,
    }))
  }),
  getManyWithPreview: protectedProcedure.query(async ({ ctx }) => {
    // Загружаем только 6 последних проектов для главной страницы
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 12, // Берем больше чтобы отфильтровать проекты без фрагментов
      include: {
        messages: {
          where: {
            fragment: {
              isNot: null,
            },
          },
          include: {
            fragment: {
              select: {
                id: true,
                title: true,
                files: true,
                sandboxUrl: true,
                screenshot: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    return projects.map((project) => ({
      ...project,
      hasFiles:
        project.messages.length > 0 && project.messages[0]?.fragment?.files,
      latestFragment: project.messages[0]?.fragment || null,
    }))
  }),
  create: protectedProcedure
    .input(
      z
        .object({
          value: z.string().max(10000, { message: 'Value is too long' }),
          images: z
            .array(
              z.object({
                data: z.string(),
                mimeType: z.string(),
                size: z.number(),
                width: z.number(),
                height: z.number(),
              })
            )
            .nullable()
            .optional(),
        })
        .refine(
          (data) =>
            data.value.trim().length > 0 ||
            (data.images && data.images.length > 0),
          { message: 'Either message text or images must be provided' }
        )
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

      const chatName = await generateChatName(input.value)

      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          status: 'PENDING',
          name: chatName,
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
              isFirst: true,
              images: input.images || undefined,
            },
          },
        },
      })

      return createdProject
    }),

  handleUserMessage: protectedProcedure
    .input(
      z
        .object({
          projectId: z.string().min(1, { message: 'Project ID is required' }),
          value: z.string().max(10000, { message: 'Message is too long' }),
          isFirst: z.boolean().optional(),
          images: z
            .array(
              z.object({
                data: z.string(),
                mimeType: z.string(),
                size: z.number(),
                width: z.number(),
                height: z.number(),
              })
            )
            .nullable()
            .optional(),
        })
        .refine(
          (data) =>
            data.value.trim().length > 0 ||
            (data.images && data.images.length > 0),
          { message: 'Either message text or images must be provided' }
        )
    )
    .mutation(async function* ({ input, ctx, signal }) {
      try {
        if (!input.isFirst) {
          await consumeCredits()
          await prisma.project.update({
            where: { id: input.projectId, userId: ctx.auth.userId },
            data: {
              messages: {
                create: {
                  content: input.value,
                  role: 'USER',
                  type: 'RESULT',
                  images: input.images || undefined,
                },
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
        const startTime = Date.now()

        const history = await prisma.message.findMany({
          where: {
            projectId: input.projectId,
            project: {
              userId: ctx.auth.userId,
            },
          },
        })

        interface ImageData {
          data: string
          mimeType: string
          size: number
          width: number
          height: number
        }

        const messagesForApi: ChatCompletionMessageParam[] = history.map(
          (msg) => {
            const role = msg.role.toLowerCase() as 'user' | 'assistant'

            // Если есть изображения, используем мультимодальный формат (только для user)
            if (
              role === 'user' &&
              msg.images &&
              Array.isArray(msg.images) &&
              msg.images.length > 0
            ) {
              const content: Array<
                | { type: 'text'; text: string }
                | { type: 'image_url'; image_url: { url: string } }
              > = [{ type: 'text', text: msg.content }]

              // Добавляем изображения
              const images = msg.images as unknown as ImageData[]
              images.forEach((image) => {
                content.push({
                  type: 'image_url',
                  image_url: {
                    url: image.data,
                  },
                })
              })

              return { role: 'user' as const, content }
            }

            // Обычный текстовый формат
            return { role, content: msg.content }
          }
        )

        // Добавляем системный промпт для обычных сообщений (не для первого сообщения проекта)
        // Это обеспечивает структурированные ответы в markdown формате
        if (!input.isFirst && messagesForApi.length > 0) {
          messagesForApi.unshift({
            role: 'system',
            content: CHAT_SYSTEM_PROMPT,
          })
        }

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

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta || ''
          const toolCallDelta = delta?.tool_calls?.[0]
          if (toolCallDelta) {
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
              // Проверяем статус проекта перед вызовом createProjectTool
              const project = await prisma.project.findUnique({
                where: { id: input.projectId },
                select: { status: true, sandboxId: true },
              })

              // Если проект уже завершен, не вызываем createProjectTool
              if (project?.status === 'COMPLETED') {
                console.log(
                  `Project ${input.projectId} is already completed, skipping createProjectTool call`
                )
                return
              }

              // Если проект уже в процессе генерации (PENDING + есть sandboxId), не вызываем createProjectTool
              if (project?.status === 'PENDING' && project.sandboxId) {
                console.log(
                  `Project ${input.projectId} is already in progress with sandbox ${project.sandboxId}, skipping createProjectTool call`
                )
                return
              }

              const functionToCall = availableFunctions[toolCallName]
              await functionToCall({ input })
            }

            return
          }
        }

        if (assistantContent) {
          const generationTime = (Date.now() - startTime) / 1000

          await prisma.project.update({
            where: { id: input.projectId, userId: ctx.auth.userId },
            data: {
              messages: {
                create: {
                  content: assistantContent,
                  role: 'ASSISTANT',
                  type: 'RESULT',
                  generationTime: generationTime,
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Project ID is required' }),
        name: z
          .string()
          .min(1, { message: 'Name is required' })
          .max(100, { message: 'Name is too long' }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedProject = await prisma.project.update({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
        data: {
          name: input.name,
        },
      })

      return updatedProject
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.project.delete({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
      })

      return { success: true }
    }),

  status: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId,
        },
        select: {
          status: true,
        },
      })

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      }

      return { status: project.status }
    }),
    
  // Получение текущих шагов генерации для восстановления при перезагрузке
  getCurrentReasoningSteps: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId,
        },
        select: {
          currentReasoningSteps: true,
          status: true,
        },
      })

      if (!project) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
      }

      return {
        steps: project.currentReasoningSteps as Array<{
          type: string
          phase?: string
          title: string
          description?: string
          duration?: number
          timestamp: number
          metadata?: Record<string, unknown>
        }> | null,
        status: project.status,
      }
    }),

  updateFragmentScreenshot: protectedProcedure
    .input(
      z.object({
        fragmentId: z.string().min(1, { message: 'Fragment ID is required' }),
        screenshot: z
          .string()
          .min(1, { message: 'Screenshot data is required' }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Проверяем, что фрагмент принадлежит пользователю
      const fragment = await prisma.fragment.findFirst({
        where: {
          id: input.fragmentId,
          message: {
            project: {
              userId: ctx.auth.userId,
            },
          },
        },
      })

      if (!fragment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fragment not found or access denied',
        })
      }

      // Обновляем скриншот
      const updatedFragment = await prisma.fragment.update({
        where: {
          id: input.fragmentId,
        },
        data: {
          screenshot: input.screenshot,
        },
      })

      return updatedFragment
    }),

  generateAndSaveScreenshot: protectedProcedure
    .input(
      z.object({
        fragmentId: z.string().min(1, { message: 'Fragment ID is required' }),
        url: z.string().url({ message: 'Valid URL is required' }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Проверяем, что фрагмент принадлежит пользователю
      const fragment = await prisma.fragment.findFirst({
        where: {
          id: input.fragmentId,
          message: {
            project: {
              userId: ctx.auth.userId,
            },
          },
        },
      })

      if (!fragment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Fragment not found or access denied',
        })
      }

      let browser
      try {
        // Запускаем Puppeteer с настройками для Linux/Vercel
        browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        })

        // Открываем новую страницу
        const page = await browser.newPage()

        // Устанавливаем размер окна
        await page.setViewport({ width: 1200, height: 800 })

        // Переходим по URL и ждем полной загрузки
        await page.goto(input.url, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        })

        // Делаем скриншот в base64
        const screenshotBase64 = await page.screenshot({
          encoding: 'base64',
          fullPage: false,
        })

        // Формируем Data URL
        const dataUrl = `data:image/png;base64,${screenshotBase64}`

        // Сохраняем dataUrl в базу данных
        const updatedFragment = await prisma.fragment.update({
          where: {
            id: input.fragmentId,
          },
          data: {
            screenshot: dataUrl,
          },
        })

        return updatedFragment
      } catch (error) {
        console.error('Screenshot generation failed:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate screenshot',
        })
      } finally {
        if (browser) {
          await browser.close()
        }
      }
    }),
  getSubscribeToken: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project ID is required' }),
      })
    )
    .query(async ({ input }): Promise<ProjectChannelToken> => {
      const token = await getSubscriptionToken(inngest, {
        channel: projectChannel(input.projectId),
        topics: [PROJECT_CHANNEL_TOPIC],
      });
      return token
    })
})
