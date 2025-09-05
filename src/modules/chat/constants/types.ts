import { z } from 'zod'

export const ChatId = z.string()
export const ChatMessageSchema = z.string().min(1).max(10000)

export const getManyInputSchema = z.object({
  chatId: ChatId,
})

export const sendMessageInputSchema = z.object({
  chatId: ChatId,
  content: ChatMessageSchema,
  isFirst: z.boolean().optional(),
})

export const createChatInputSchema = z.object({
  content: ChatMessageSchema,
})

export type GetManyInput = z.infer<typeof getManyInputSchema>
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>

export interface ChatMessageEntity {
  chatId: string

  content: string

  role: 'USER' | 'ASSISTANT'

  type: string
}

export type ChatMessageRole = 'USER' | 'ASSISTANT'
