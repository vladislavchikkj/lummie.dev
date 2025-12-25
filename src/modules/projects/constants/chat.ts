import { Fragment } from '@/generated/prisma'
import type { ProcessedImage } from '@/lib/image-processing'
import { ImageGenerationResponse } from '@/modules/projects/types'

export const CHAT_ROLES = {
  USER: 'USER' as const,
  ASSISTANT: 'ASSISTANT' as const,
}

export const CHAT_MESSAGE_TYPES = {
  ERROR: 'ERROR' as const,
  RESULT: 'RESULT' as const,
}

export interface LocalImagePreview {
  url: string
  file: File
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
  generatedImage?: ImageGenerationResponse | null
  images?: ProcessedImage[] | null | undefined
  localImagePreviews?: LocalImagePreview[]
}

export type DisplayedMessageEntity = ChatMessageEntity & {
  isStreaming?: boolean
}


export enum StreamChunkType {
  Chat = 'CHAT',
  Project = 'PROJECT',
  Image = 'IMAGE',
}

export interface StreamChunk {
  content: string | ImageGenerationResponse;
  type: StreamChunkType;
}

export type HandleUserMessageStream = AsyncIterableIterator<StreamChunk>;

export type TabState = 'preview' | 'code'
