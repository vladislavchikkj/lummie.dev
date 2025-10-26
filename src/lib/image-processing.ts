/**
 * Утилита для обработки изображений на клиенте
 * Сжимает изображения и конвертирует в base64 для оптимального хранения в БД
 */

export interface ProcessedImage {
  data: string // base64 строка (data:image/jpeg;base64,...)
  mimeType: string
  size: number // размер в байтах
  width: number
  height: number
}

interface CompressionOptions {
  maxWidth?: number // максимальная ширина (по умолчанию 1920)
  maxHeight?: number // максимальная высота (по умолчанию 1080)
  quality?: number // качество JPEG 0-1 (по умолчанию 0.8)
  maxSizeKB?: number // максимальный размер в КБ (по умолчанию 500)
}

/**
 * Сжимает изображение и конвертирует его в base64
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img
        let newWidth = width
        let newHeight = height

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height

          if (width > height) {
            newWidth = maxWidth
            newHeight = maxWidth / aspectRatio
          } else {
            newHeight = maxHeight
            newWidth = maxHeight * aspectRatio
          }
        }

        // Создаем canvas для ресайза
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Рисуем изображение с новыми размерами
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Конвертируем в base64 с заданным качеством
        let currentQuality = quality
        let base64Data = canvas.toDataURL('image/jpeg', currentQuality)

        // Если изображение все еще слишком большое, уменьшаем качество
        const maxSizeBytes = maxSizeKB * 1024
        while (base64Data.length > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1
          base64Data = canvas.toDataURL('image/jpeg', currentQuality)
        }

        // Если все еще слишком большое, уменьшаем разрешение
        if (base64Data.length > maxSizeBytes) {
          newWidth = Math.floor(newWidth * 0.8)
          newHeight = Math.floor(newHeight * 0.8)
          canvas.width = newWidth
          canvas.height = newHeight
          ctx.drawImage(img, 0, 0, newWidth, newHeight)
          base64Data = canvas.toDataURL('image/jpeg', 0.7)
        }

        resolve({
          data: base64Data,
          mimeType: 'image/jpeg',
          size: base64Data.length,
          width: newWidth,
          height: newHeight,
        })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Обрабатывает массив файлов изображений
 */
export async function processImages(
  files: File[],
  options?: CompressionOptions
): Promise<ProcessedImage[]> {
  const promises = files.map((file) => compressImage(file, options))
  return Promise.all(promises)
}

/**
 * Валидация файла изображения
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Проверяем размер файла (максимум 10MB)
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxFileSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  return { valid: true }
}

/**
 * Форматирует размер файла для отображения
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

