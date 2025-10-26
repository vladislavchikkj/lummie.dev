import { ReactNode, useMemo, useCallback } from 'react'
import { ReasoningLoading } from './reasoning-loading'
import { cn } from '@/lib/utils'

import { MessageCard } from './message-card'
import { Fragment } from '@/generated/prisma'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation'
import { PulsingLogo } from '@/components/ui/pulsing-logo'

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
    generationTime?: number | null
  }[]
  children: ReactNode
  projectCreating: boolean
  isStreaming?: boolean
  isMobile?: boolean
}

export const MessagesContainer = ({
  activeFragment,
  setActiveFragment,
  children,
  projectCreating,
  messages,
  isStreaming = false,
  isMobile = false,
}: Props) => {
  const lastMessage = messages[messages.length - 1]
  const isLastMessageUser = lastMessage?.role === 'USER'
  const isCenteredLayout = !activeFragment || isMobile

  const handleFragmentClick = useCallback(
    (fragment: Fragment | null) => {
      setActiveFragment(fragment)
    },
    [setActiveFragment]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Conversation messagesCount={messages.length}>
          <ConversationContent
            className={cn(
              'flex min-h-0 flex-col pt-5 pb-5',
              isCenteredLayout && 'mx-auto max-w-3xl',
              isMobile && 'px-3'
            )}
          >
            {useMemo(() => {
              return messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const isCurrentlyStreaming = isStreaming && isLastMessage
                const isLastAssistantMessage =
                  isLastMessage && message.role === 'ASSISTANT'
                const isLastUserMessage =
                  isLastMessage && message.role === 'USER'
                const shouldShowReasoningLoading =
                  isLastMessageUser && projectCreating && !isStreaming

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex flex-col',
                      isLastAssistantMessage && 'min-h-[max(200px,40cqh)]',
                      isLastUserMessage &&
                        !shouldShowReasoningLoading &&
                        'min-h-[max(200px,40cqh)]'
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
                      generationTime={message.generationTime}
                    />
                    {isLastUserMessage && (isStreaming || projectCreating) && (
                      <div className="mt-2 mb-4 flex items-center gap-2">
                        <PulsingLogo width={24} height={24} />
                      </div>
                    )}
                  </div>
                )
              })
            }, [
              messages,
              isStreaming,
              activeFragment?.id,
              handleFragmentClick,
              isLastMessageUser,
              projectCreating,
            ])}
            {isLastMessageUser && projectCreating && !isStreaming && (
              <div className="min-h-[max(200px,40cqh)] py-4">
                <ReasoningLoading />
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="relative shrink-0 p-3 pt-1 pb-4">
        <div className="to-background pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent" />
        <div
          className={cn(
            isCenteredLayout && 'mx-auto max-w-3xl',
            isMobile && ''
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
