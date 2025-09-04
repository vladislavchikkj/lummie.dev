import { z } from 'zod'

export const ChatId = z.string()
export const ChatMessage = z.string().min(1).max(10000)

export const getManyInputSchema = z.object({
  chatId: ChatId,
})

export const sendMessageInputSchema = z.object({
  chatId: ChatId,
  content: ChatMessage,
})

export const createChatInputSchema = z.object({
  content: ChatMessage,
})

export type GetManyInput = z.infer<typeof getManyInputSchema>
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>

export interface ChatMessage {
  chatId: string

  content: string

  role: 'USER' | 'ASSISTANT'

  type: string
}

export type ChatMessageRole = 'USER' | 'ASSISTANT'
