'use client'

import React, { useEffect, useRef } from 'react'
import { ChatUserMessage } from '@/modules/chat/ui/components/chat-user-message'
import { ChatModelMessage } from '@/modules/chat/ui/components/chat-model-message'
import { ChatMessageEntity } from '@/modules/chat/constants/types'
import { cn } from '@/lib/utils'
import { CHAT_ROLES } from '@/modules/chat/constants'

type DisplayedMessageEntity = ChatMessageEntity & { isStreaming?: boolean }

type Props = {
  messages: DisplayedMessageEntity[]
}

const ChatMessageWrapper = ({
  children,
  isStreaming,
}: {
  children: React.ReactNode
  isStreaming?: boolean
}) => {
  return (
    <div className={cn('animate-fade-in-up', isStreaming && 'animate-pulse')}>
      {children}
    </div>
  )
}

export const ChatMessagesContainer = ({ messages }: Props) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return

    const timer = setTimeout(() => {
      const scrollContainer = scrollContainerRef.current
      const lastMessageEl = lastMessageRef.current

      if (!scrollContainer) return

      if (lastMessage.role === CHAT_ROLES.USER && lastMessageEl) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const messageRect = lastMessageEl.getBoundingClientRect()
        const scrollTop =
          messageRect.top - containerRect.top + scrollContainer.scrollTop
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        })
      } else {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [messages])

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto mt-auto max-w-3xl space-y-8 px-4 py-10">
        {messages.map((msg, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <ChatMessageWrapper isStreaming={!!msg.isStreaming}>
              {msg.role === 'USER' ? (
                <ChatUserMessage content={msg.content} />
              ) : (
                <ChatModelMessage content={msg.content} />
              )}
            </ChatMessageWrapper>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}
