import { ImageGenerationResponse } from '@/modules/projects/types'
import { TRPCError } from '@trpc/server'

export default async function editImageTool({ instruction, image }: {
  instruction: string,
  image: string
}): Promise<ImageGenerationResponse> {
  if (!process.env.REVE_API_URL || !process.env.REVE_API_KEY) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR', message: 'Image generation service not configured',
    })
  }
  const link = `${process.env.REVE_API_URL}/edit`
  const authToken = process.env.REVE_API_KEY

  const parts = image.split(',')
  if (parts.length !== 2 || !parts[1]) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid image data format',
    })
  }
  const base64Only = parts[1]
  try {
    const response = await fetch(link, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          edit_instruction: instruction,
          reference_image: base64Only,
        }),
        signal: AbortSignal.timeout(30000)
      },
    )
    if (!response.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Image editing failed: ${response.status} ${response.statusText}`,
      })
    }

    const result = await response.json()

    if (!result.image || typeof result.image !== 'string') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid response from image editing service',
      })
    }

    const dataUri = `data:image/png;base64,${result.image}`
    return {
      imageBase64: dataUri,
      content_violation: result.content_violation ?? false,
      request_id: result.request_id ?? '',
      version: result.version ?? '',
    }
  } catch
    (error) {
    if (error instanceof TRPCError) {
      throw error
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Image editing failed',
    })
  }
}