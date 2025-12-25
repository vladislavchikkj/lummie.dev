import { ImagePrompt } from '@/modules/projects/types/index'

export function isImagePrompt(obj: unknown): obj is ImagePrompt {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false
  }
  const potentialImagePrompt = obj as Record<string, unknown>
  return !!(
    potentialImagePrompt?.prompt && typeof potentialImagePrompt.prompt === 'string' &&
    potentialImagePrompt?.aspect_ratio && typeof potentialImagePrompt.aspect_ratio === 'string'
  )
}