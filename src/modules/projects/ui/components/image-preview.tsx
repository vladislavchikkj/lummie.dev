'use client'

import { useState } from 'react'
import { PulsingLogo } from '@/components/ui/pulsing-logo'
import { cn } from '@/lib/utils'

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

  return (
    <div
      className={cn(
        'border-border relative overflow-hidden rounded-lg border',
        className
      )}
    >
      {isLoading && !hasError && (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <PulsingLogo width={32} height={32} />
            <p className="text-muted-foreground text-xs">
              {isLocal ? 'Обработка...' : 'Загрузка...'}
            </p>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'max-h-60 max-w-full object-contain transition-opacity duration-200',
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

      {hasError && (
        <div className="bg-muted text-muted-foreground flex min-h-[240px] items-center justify-center p-4 text-center text-sm">
          Не удалось загрузить изображение
        </div>
      )}
    </div>
  )
}
