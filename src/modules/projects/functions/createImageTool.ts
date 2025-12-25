import { ImageGenerationResponse, ImagePrompt } from '@/modules/projects/types'

export default async function createImageTool(prompt: ImagePrompt): Promise<ImageGenerationResponse> {
  const link = `${process.env.REVE_API_URL}/create`
  const authToken = process.env.REVE_API_KEY
  const res = await fetch(link, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(prompt),
  })

  const data = await res.json()
  const dataUri = `data:image/png;base64,${data.image}`
  return {
    imageBase64: dataUri,
    content_violation: data.content_violation,
    request_id: data.request_id,
    version: data.version,
  }
}
