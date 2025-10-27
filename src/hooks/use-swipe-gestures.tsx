'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSidebar } from '@/components/ui/sidebar'

interface SwipeGestureOptions {
  threshold?: number // Минимальное расстояние свайпа
  velocityThreshold?: number // Минимальная скорость свайпа
  preventDefault?: boolean // Предотвращать стандартное поведение браузера
}

export function useSwipeGestures(options: SwipeGestureOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefault = true,
  } = options

  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  const touchStartRef = useRef<{
    x: number
    y: number
    time: number
  } | null>(null)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Работаем только на мобильных устройствах
      if (!isMobile) return

      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }
    },
    [isMobile]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !isMobile) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // Предотвращаем стандартное поведение только для горизонтальных свайпов
      if (preventDefault && Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault()
      }
    },
    [isMobile, preventDefault]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !isMobile) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Вычисляем скорость свайпа
      const velocity = Math.abs(deltaX) / deltaTime

      // Проверяем, что это горизонтальный свайп (больше горизонтального движения)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)

      // Проверяем минимальное расстояние и скорость
      const isSignificantSwipe =
        Math.abs(deltaX) > threshold && velocity > velocityThreshold

      // Дополнительная проверка: свайп должен быть достаточно быстрым
      const isFastSwipe = deltaTime < 500 // Максимум 500мс

      if (isHorizontalSwipe && isSignificantSwipe && isFastSwipe) {
        // Свайп слева направо - открываем сайдбар
        if (deltaX > 0 && !openMobile) {
          setOpenMobile(true)
          e.preventDefault()
          e.stopPropagation()
        }
        // Свайп справа налево - закрываем сайдбар
        else if (deltaX < 0 && openMobile) {
          setOpenMobile(false)
          e.preventDefault()
          e.stopPropagation()
        }
      }

      touchStartRef.current = null
    },
    [
      isMobile,
      threshold,
      velocityThreshold,
      openMobile,
      setOpenMobile,
      preventDefault,
    ]
  )

  useEffect(() => {
    if (!isMobile) return

    // Добавляем обработчики событий
    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isSwipeEnabled: isMobile,
  }
}
