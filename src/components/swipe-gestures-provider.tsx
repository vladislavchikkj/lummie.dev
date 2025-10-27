'use client'

import { useSwipeGestures } from '@/hooks/use-swipe-gestures'

interface SwipeGesturesProviderProps {
  children: React.ReactNode
}

export function SwipeGesturesProvider({
  children,
}: SwipeGesturesProviderProps) {
  // Инициализируем обработчик свайпов
  useSwipeGestures({
    threshold: 50, // Минимальное расстояние свайпа в пикселях
    velocityThreshold: 0.3, // Минимальная скорость свайпа
    preventDefault: true, // Предотвращаем стандартное поведение браузера
  })

  return <>{children}</>
}
