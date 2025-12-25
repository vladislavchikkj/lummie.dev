import { ImageGenerationResponse } from '@/modules/projects/types'

export default async function editImageTool({instruction, image}: {instruction: string ,image: string}): Promise<ImageGenerationResponse> {
  const link = `${process.env.REVE_API_URL}/edit`
  const authToken = process.env.REVE_API_KEY;
  const base64Only = image.split(',')[1];
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
    },
  )
  const result = await response.json()
  const dataUri = `data:image/png;base64,${result.image}`
  return {
    imageBase64: dataUri,
    content_violation: result.content_violation,
    request_id: result.request_id,
    version: result.version,
  }
}