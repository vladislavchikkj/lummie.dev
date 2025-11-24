'use client'

import { useEffect } from 'react'

/**
 * Компонент для предотвращения смещения UI при открытии модальных окон на Windows.
 * Сохраняет место для scrollbar, когда body блокируется через overflow: hidden (Radix UI).
 */
export function ScrollbarGutterFix() {
  useEffect(() => {
    // Функция для вычисления ширины scrollbar
    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth
    }

    let scrollbarWidth = getScrollbarWidth()
    let isLockedByUs = false

    // Функция для проверки блокировки скролла
    const checkScrollLock = () => {
      const bodyStyle = window.getComputedStyle(document.body)
      const htmlStyle = window.getComputedStyle(document.documentElement)
      
      const isScrollLocked = 
        bodyStyle.overflow === 'hidden' || 
        bodyStyle.overflowY === 'hidden' ||
        htmlStyle.overflow === 'hidden' ||
        htmlStyle.overflowY === 'hidden'

      if (isScrollLocked) {
        // Обновляем ширину scrollbar
        scrollbarWidth = getScrollbarWidth()
        
        // Добавляем padding только если scrollbar есть и padding еще не установлен
        if (scrollbarWidth > 0) {
          const currentPadding = parseInt(bodyStyle.paddingRight) || 0
          // Проверяем, не был ли padding установлен кодом сайдбара (который использует position: fixed)
          const isFixed = bodyStyle.position === 'fixed'
          
          // Добавляем padding только если body не в fixed режиме (т.е. это Radix UI блокировка)
          // или если padding меньше нужного
          if (!isFixed && currentPadding < scrollbarWidth) {
            document.body.style.paddingRight = `${scrollbarWidth}px`
            isLockedByUs = true
          }
        }
      } else if (isLockedByUs) {
        // Убираем padding только если мы его установили
        document.body.style.paddingRight = ''
        isLockedByUs = false
      }
    }

    // Создаем MutationObserver для отслеживания изменений стилей
    const observer = new MutationObserver(() => {
      checkScrollLock()
    })

    // Начинаем наблюдение за изменениями атрибутов style у body и html
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style'],
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    })

    // Периодическая проверка для случаев, когда Radix UI изменяет стили напрямую
    const intervalId = setInterval(() => {
      checkScrollLock()
    }, 50)

    // Обработчик изменения размера окна
    const handleResize = () => {
      scrollbarWidth = getScrollbarWidth()
      checkScrollLock()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      clearInterval(intervalId)
      window.removeEventListener('resize', handleResize)
      // Очищаем padding только если мы его установили
      if (isLockedByUs) {
        document.body.style.paddingRight = ''
      }
    }
  }, [])

  return null
}

