export type ImagePrompt = {
  prompt: string;
  aspect_ratio: string;
}

export type ImageGenerationResponse = {
  imageBase64: string;
  content_violation: boolean;
  request_id: string;
  version: string;
  credits_used?: string;
  credits_remaining?: string;
}