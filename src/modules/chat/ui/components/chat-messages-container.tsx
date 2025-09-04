'use client'
import React, { useEffect, useRef } from 'react'
import { ChatUserMessage } from '@/modules/chat/ui/components/chat-user-message'
import { ChatModelMessage } from '@/modules/chat/ui/components/chat-model-message'
import { ChatMessage } from '@/modules/chat/constants/types'

type Props = {
  messages: ChatMessage[]
}

export const ChatMessagesContainer = ({ messages }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto p-10">
      {messages.map((msg, index) =>
        msg.role === 'USER' ? (
          <ChatUserMessage key={index} content={msg.content} />
        ) : (
          <ChatModelMessage key={index} content={msg.content} />
        )
      )}
      <div ref={bottomRef} />
    </div>
  )
}
