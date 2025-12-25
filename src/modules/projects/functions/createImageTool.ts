import { ImageGenerationResponse, ImagePrompt } from '@/modules/projects/types'
import { TRPCError } from '@trpc/server'

export default async function createImageTool(prompt: ImagePrompt): Promise<ImageGenerationResponse> {
  if (!process.env.REVE_API_URL || !process.env.REVE_API_KEY) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR', message: 'Image generation service not configured',
    })
  }


  const link = `${process.env.REVE_API_URL}/create`
  const authToken = process.env.REVE_API_KEY

  try {
    const res = await fetch(link, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(prompt),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!res.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Image generation failed: ${res.status} ${res.statusText}`,
      })
    }
    const data = await res.json()

    if (!data.image || typeof data.image !== 'string') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid response from image generation service',
      })
    }
    const dataUri = `data:image/png;base64,${data.image}`
    return {
      imageBase64: dataUri,
      content_violation: data.content_violation ?? false,
      request_id: data.request_id ?? '',
      version: data.version ?? '',
    }
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Image generation failed',
    })
  }
}