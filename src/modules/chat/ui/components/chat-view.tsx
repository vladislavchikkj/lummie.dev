'use client'

import { ChatMessagesContainer } from '@/modules/chat/ui/components/chat-messages-container'
import { ChatMessageFrom } from '@/modules/chat/ui/components/chat-message-from'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ChatMessageEntity } from '@/modules/chat/constants/types'
import { useQuery } from '@tanstack/react-query'
import { CHAT_MESSAGE_TYPES, CHAT_ROLES } from '@/modules/chat/constants'
import { TRPCClientError } from '@trpc/client'

type Props = { chatId: string }

type DisplayedMessageEntity = ChatMessageEntity & { isStreaming?: boolean }

export const ChatView = ({ chatId }: Props) => {
  const [messages, setMessages] = useState<ChatMessageEntity[]>([])
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [pendingUserMessage, setPendingUserMessage] =
    useState<ChatMessageEntity | null>(null)

  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const { data: initialMessages, refetch } = useQuery(
    trpc.chat.getMany.queryOptions(
      { chatId },
      {
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      }
    )
  )

  const onSubmit = useCallback(
    async (message: string, isFirstMessage: boolean = false) => {
      if (isStreaming || !message.trim()) return

      abortControllerRef.current = new AbortController()

      const userMsg: ChatMessageEntity = {
        role: CHAT_ROLES.USER,
        content: message,
        chatId,
        type: CHAT_MESSAGE_TYPES.TEXT,
      }

      if (!isFirstMessage) {
        setPendingUserMessage(userMsg)
      }

      setIsStreaming(true)
      setStreamingContent('')

      try {
        const stream = await trpcClient.chat.sendMessage.mutate(
          {
            chatId,
            content: message,
            isFirst: isFirstMessage,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        )

        for await (const chunk of stream) {
          setStreamingContent((prev) => prev + chunk)
        }
      } catch (error) {
        const isAbortError =
          error instanceof TRPCClientError &&
          (error.data?.code === 'CLIENT_CLOSED_REQUEST' ||
            error.cause?.name === 'AbortError')

        if (!isAbortError) {
          console.error('Streaming error:', error)
        }
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
        await refetch()

        setPendingUserMessage(null)
        setStreamingContent('')
      }
    },
    [chatId, isStreaming, refetch, trpcClient.chat.sendMessage]
  )

  useEffect(() => {
    if (initialMessages) {
      const lastMessage = initialMessages[initialMessages.length - 1]
      const isUserFirstMsg = lastMessage?.isFirst && lastMessage.role === 'USER'

      if (isUserFirstMsg) {
        setMessages(initialMessages.slice(0, -1))
        onSubmit(lastMessage.content, true)
      } else {
        setMessages(initialMessages)
      }
    }
  }, [initialMessages, onSubmit])

  const displayedMessages = useMemo((): DisplayedMessageEntity[] => {
    const allMessages: DisplayedMessageEntity[] = [...messages]

    if (pendingUserMessage) {
      allMessages.push(pendingUserMessage)
    }

    if (streamingContent || isStreaming) {
      allMessages.push({
        role: CHAT_ROLES.ASSISTANT,
        content: streamingContent || '',
        chatId,
        type: CHAT_MESSAGE_TYPES.TEXT,
        isStreaming: true,
      })
    }
    return allMessages
  }, [messages, pendingUserMessage, streamingContent, isStreaming, chatId])

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return (
    <section className="bg-background flex h-screen flex-col">
      <ChatMessagesContainer messages={displayedMessages} />
      <ChatMessageFrom
        rootChat={false}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
        onStop={handleStopStreaming}
      />
    </section>
  )
}
