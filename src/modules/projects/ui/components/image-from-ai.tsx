import { ImagePreview } from '@/modules/projects/ui/components/image-preview'
import { ImageGenerationResponse } from '@/modules/projects/types'

export interface NextImageBase64DynamicDisplayProps {
  image: ImageGenerationResponse
}

export default function NextImageBase64DynamicDisplay({ image }: NextImageBase64DynamicDisplayProps) {
  if (!image.imageBase64) {
    return <p>No data.</p>
  }

  return (
    <div className="w-full h-full flex items-center justify-start p-4">
      <ImagePreview
        src={image.imageBase64}
        alt="AI Generated Content"
      />
    </div>
  )
}