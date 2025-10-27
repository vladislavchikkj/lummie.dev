'use client'

import { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import { PulsingLogo } from '@/components/ui/pulsing-logo'
import { cn } from '@/lib/utils'
import { ImageModal } from './image-modal'

interface ImagePreviewProps {
  src: string
  alt: string
  className?: string
  isLocal?: boolean
}

export const ImagePreview = ({
  src,
  alt,
  className,
  isLocal = false,
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = () => {
    if (!isLoading && !hasError) {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          'border-border group relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md',
          'cursor-pointer',
          className
        )}
        onClick={handleImageClick}
      >
        {isLoading && !hasError && (
          <div className="bg-muted absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <PulsingLogo width={32} height={32} />
              <p className="text-muted-foreground text-xs">
                {isLocal ? 'Processing...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={cn(
            'max-h-48 max-w-full object-contain transition-all duration-200 sm:max-h-60',
            isLoading ? 'opacity-0' : 'opacity-100',
            hasError && 'hidden'
          )}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />

        {/* Zoom overlay */}
        {!isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/20 sm:group-hover:bg-black/20">
            <ZoomIn className="h-4 w-4 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 sm:h-5 sm:w-5" />
          </div>
        )}

        {hasError && (
          <div className="bg-muted text-muted-foreground flex min-h-[240px] items-center justify-center p-4 text-center text-sm">
            Failed to load image
          </div>
        )}
      </div>

      <ImageModal
        src={src}
        alt={alt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
