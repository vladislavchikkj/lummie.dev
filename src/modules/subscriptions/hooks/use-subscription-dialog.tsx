'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Автоматически открываем dialog при возврате с оплаты
  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get('success')
    if (success === 'true') {
      setOpen(true)
      // Убираем параметр из URL
      router.replace(window.location.pathname, { scroll: false })
    }
  }, [router])

  // Глобальное событие для открытия dialog из любого места
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOpenDialog = () => {
      setOpen(true)
    }

    window.addEventListener('open-subscription-dialog', handleOpenDialog)
    return () => {
      window.removeEventListener('open-subscription-dialog', handleOpenDialog)
    }
  }, [])

  return (
    <SubscriptionDialogContext.Provider value={{ open, setOpen }}>
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
    window.dispatchEvent(new Event('open-subscription-dialog'))
  }
}

