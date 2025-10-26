import { Fragment } from '@/generated/prisma'
import type { ProcessedImage } from '@/lib/image-processing'

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
  images?: ProcessedImage[] | null | undefined
}

export type DisplayedMessageEntity = ChatMessageEntity & {
  isStreaming?: boolean
}

export type AssistantMessageType = 'CHAT' | 'PROJECT'
export type TabState = 'preview' | 'code'
