import { ReactNode, useEffect, useRef, useMemo, useCallback } from 'react'
import { ReasoningLoading } from './reasoning-loading'
import { cn } from '@/lib/utils'

import { MessageCard } from './message-card'
import { Fragment } from '@/generated/prisma'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation'

interface Props {
  activeFragment: Fragment | null
  setActiveFragment: (fragment: Fragment | null) => void
  messages: {
    id: string
    content: string
    role: 'USER' | 'ASSISTANT'
    type: 'RESULT' | 'ERROR'
    createdAt: Date
    fragment: Fragment | null
  }[]
  children: ReactNode
  projectCreating: boolean
  isStreaming?: boolean
}

export const MessagesContainer = ({
  activeFragment,
  setActiveFragment,
  children,
  projectCreating,
  messages,
  isStreaming = false,
}: Props) => {
  const lastMessage = messages[messages.length - 1]
  const isLastMessageUser = lastMessage?.role === 'USER'
  const isCenteredLayout = !activeFragment
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFragmentClick = useCallback(
    (fragment: Fragment | null) => {
      setActiveFragment(fragment)
    },
    [setActiveFragment]
  )

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight
        }
      }, 50)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, projectCreating, scrollToBottom])

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              const container = scrollContainerRef.current
              const isNearBottom =
                container.scrollHeight -
                  container.scrollTop -
                  container.clientHeight <
                100

              if (isNearBottom) {
                container.scrollTop = container.scrollHeight
              }
            }
          })
        }
      }, 150)

      return () => clearInterval(interval)
    }
  }, [isStreaming])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <Conversation>
          <ConversationContent
            className={cn(
              'flex min-h-0 flex-col pt-5 pb-5',
              isCenteredLayout && 'mx-auto max-w-3xl'
            )}
          >
            {useMemo(
              () =>
                messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1
                  const isCurrentlyStreaming = isStreaming && isLastMessage
                  const isLastAssistantMessage =
                    isLastMessage && message.role === 'ASSISTANT'
                  const isLastUserMessage =
                    isLastMessage && message.role === 'USER'

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex flex-col',
                        isLastAssistantMessage && 'min-h-[max(200px,40cqh)]',

                        isLastUserMessage && 'min-h-[max(200px,40cqh)]'
                      )}
                    >
                      <MessageCard
                        content={message.content}
                        role={message.role}
                        fragment={message.fragment}
                        createdAt={message.createdAt}
                        isActiveFragment={
                          activeFragment?.id === message.fragment?.id
                        }
                        onFragmentClick={handleFragmentClick}
                        type={message.type}
                        isStreaming={isCurrentlyStreaming}
                      />
                    </div>
                  )
                }),
              [messages, isStreaming, activeFragment?.id, handleFragmentClick]
            )}
            {isLastMessageUser && projectCreating && !isStreaming && (
              <ReasoningLoading />
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="relative shrink-0 p-3 pt-1">
        <div className="to-background pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent" />
        <div className={cn(isCenteredLayout && 'mx-auto max-w-3xl')}>
          {children}
        </div>
      </div>
    </div>
  )
}
