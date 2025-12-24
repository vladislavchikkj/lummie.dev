'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

interface SubscriptionDialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SubscriptionDialogContext = createContext<
  SubscriptionDialogContextType | undefined
>(undefined)

export function SubscriptionDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpenState] = useState(false)
  const router = useRouter()

  // Функция для открытия dialog с добавлением хеша в URL
  const handleSetOpen = useCallback(
    (isOpen: boolean) => {
      setOpenState(isOpen)
      if (typeof window !== 'undefined') {
        if (isOpen) {
          // Добавляем хеш #pricing в URL
          window.history.pushState(null, '', '#pricing')
        } else {
          // Убираем хеш при закрытии
          if (window.location.hash === '#pricing') {
            window.history.pushState(
              null,
              '',
              window.location.pathname + window.location.search
            )
          }
        }
      }
    },
    []
  )

  // Автоматически открываем dialog при возврате с оплаты
  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get('success')
    if (success === 'true') {
      handleSetOpen(true)
      // Убираем параметр из URL
      router.replace(window.location.pathname + '#pricing', { scroll: false })
    }
  }, [router, handleSetOpen])

  // Автоматически открываем dialog при наличии хеша #pricing в URL
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (window.location.hash === '#pricing') {
      handleSetOpen(true)
    }

    // Слушаем изменения хеша (навигация назад/вперед)
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        handleSetOpen(true)
      } else {
        setOpenState(false)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [handleSetOpen])

  // Глобальное событие для открытия dialog из любого места
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOpenDialog = () => {
      handleSetOpen(true)
    }

    window.addEventListener('open-subscription-dialog', handleOpenDialog)
    return () => {
      window.removeEventListener('open-subscription-dialog', handleOpenDialog)
    }
  }, [handleSetOpen])

  return (
    <SubscriptionDialogContext.Provider value={{ open, setOpen: handleSetOpen }}>
      {children}
    </SubscriptionDialogContext.Provider>
  )
}

export function useSubscriptionDialog() {
  const context = useContext(SubscriptionDialogContext)
  if (context === undefined) {
    // Fallback для случаев, когда провайдер не обернут
    return {
      open: false,
      setOpen: (open: boolean) => {
        if (typeof window !== 'undefined' && open) {
          window.dispatchEvent(new Event('open-subscription-dialog'))
        }
      },
    }
  }
  return context
}

// Функция для открытия dialog из любого места (включая хуки)
export function openSubscriptionDialog() {
  if (typeof window !== 'undefined') {
    window.location.hash = '#pricing'
    window.dispatchEvent(new Event('open-subscription-dialog'))
  }
}

