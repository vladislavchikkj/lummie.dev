'use client'

import { ChatMessagesContainer } from '@/modules/chat/ui/components/chat-messages-container'
import { ChatMessageFrom } from '@/modules/chat/ui/components/chat-message-from'
import { useTRPC } from '@/trpc/client'
import { useState, useEffect, useMemo } from 'react'
import { ChatMessage } from '@/modules/chat/constants/types'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  CHAT_ERROR_MESSAGE_FRAGMENT,
  CHAT_MESSAGE_TYPES,
  CHAT_ROLES,
} from '@/modules/chat/constants'

type Props = { chatId: string }

export const ChatView = ({ chatId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const trpc = useTRPC()

  const { data: initialMessages, refetch } = useQuery(
    trpc.chat.getMany.queryOptions(
      { chatId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      }
    )
  )

  useEffect(() => {
    if (initialMessages) {
      const isUserFirstMsg =
        initialMessages[initialMessages.length - 1]?.isFirst

      if (isUserFirstMsg) {
        onSubmit(initialMessages[initialMessages.length - 1].content, true)
      }

      setMessages(() => initialMessages)
    }
  }, [initialMessages])

  const sendMessageMutation = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      onError: (error) => {
        console.error('Error sending message:', error)
        setIsStreaming(false)
        setStreamingContent((prev) => prev + CHAT_ERROR_MESSAGE_FRAGMENT)
      },
    })
  )

  const onSubmit = async (message: string, firstMsg: boolean = false) => {
    if (isStreaming || !message.trim()) return
    const userMsg: ChatMessage = {
      role: CHAT_ROLES.USER,
      content: message,
      chatId,
      type: CHAT_MESSAGE_TYPES.TEXT,
    }

    if (!firstMsg) {
      setMessages((prevMessages) => [...prevMessages, userMsg])
    }

    setIsStreaming(true)
    setStreamingContent('')

    try {
      const stream = await sendMessageMutation.mutateAsync({
        chatId,
        content: message,
        isFirst: firstMsg,
      })

      for await (const chunk of stream) {
        setStreamingContent((prev) => prev + chunk)
      }

      await refetch()
      setIsStreaming(false)
      setStreamingContent('')
    } catch (error) {
      console.error('Stream processing failed:', error)
    }
  }

  const displayedMessages = useMemo(() => {
    const allMessages = [...messages]
    if (streamingContent) {
      allMessages.push({
        role: CHAT_ROLES.ASSISTANT,
        content: streamingContent,
        chatId,
        type: CHAT_MESSAGE_TYPES.TEXT,
      })
    }
    return allMessages
  }, [messages, streamingContent, chatId])

  return (
    <section className="flex h-screen min-h-0 flex-1 flex-col">
      <ChatMessagesContainer messages={displayedMessages} />
      <ChatMessageFrom
        rootChat={false}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
      />
    </section>
  )
}
