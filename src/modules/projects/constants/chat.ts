import { Fragment } from '@/generated/prisma'

export const CHAT_ROLES = {
  USER: 'USER' as const,
  ASSISTANT: 'ASSISTANT' as const,
}

export const CHAT_MESSAGE_TYPES = {
  ERROR: 'ERROR' as const,
  RESULT: 'RESULT' as const,
}

export interface ChatMessageEntity {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT'
  type: 'RESULT' | 'ERROR'
  createdAt: Date
  fragment: Fragment | null
  isFirst?: boolean
  generationTime?: number | null
}

export type DisplayedMessageEntity = ChatMessageEntity & {
  isStreaming?: boolean
}

export type AssistantMessageType = 'CHAT' | 'PROJECT'
export type TabState = 'preview' | 'code'
