'use client'

import { useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageModalProps {
  src: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export const ImageModal = ({ src, alt, isOpen, onClose }: ImageModalProps) => {
  // Блокируем скролл страницы когда модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = alt || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-background relative max-h-[90vh] max-w-[95vw] overflow-hidden rounded-lg shadow-2xl sm:max-h-[90vh] sm:max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with buttons */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-2 sm:p-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate text-xs text-white/90 sm:text-sm">
              {alt}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20 sm:h-8 sm:w-8"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20 sm:h-8 sm:w-8"
              onClick={onClose}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center p-2 pt-12 sm:p-4 sm:pt-16">
          <img
            src={src}
            alt={alt}
            className="h-auto max-h-[calc(95vh-6rem)] w-auto max-w-[calc(95vw-1rem)] object-contain sm:max-h-[calc(90vh-8rem)] sm:max-w-[calc(90vw-2rem)]"
          />
        </div>

        {/* Close hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4">
          <div className="rounded-full bg-black/50 px-2 py-1 text-xs text-white/70 sm:px-3">
            <span className="hidden sm:inline">
              Press Escape or click outside to close
            </span>
            <span className="sm:hidden">Click outside to close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
