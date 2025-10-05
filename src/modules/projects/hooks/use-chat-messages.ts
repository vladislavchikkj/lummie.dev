import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/trpc/client'
import {
  ChatMessageEntity,
  DisplayedMessageEntity,
  CHAT_ROLES,
} from '../constants/chat'

interface UseChatMessagesProps {
  projectId: string
  isStreaming: boolean
  streamingContent: string
  streamingCompleted: boolean
  wasStreamAborted: boolean
  pendingUserMessage: ChatMessageEntity | null
  lastGenerationTime: number | null
  currentStreamingStartTime: number | null
  finalGenerationTime: number | null
  onFirstMessageSubmit: (content: string) => void
  onMessagesUpdate: (messages: ChatMessageEntity[]) => void
  onStreamingContentClear: () => void
  onPendingMessageClear: () => void
}

export const useChatMessages = ({
  projectId,
  isStreaming,
  streamingContent,
  streamingCompleted,
  wasStreamAborted,
  pendingUserMessage,
  lastGenerationTime,
  currentStreamingStartTime,
  finalGenerationTime,
  onFirstMessageSubmit,
  onMessagesUpdate,
  onStreamingContentClear,
  onPendingMessageClear,
}: UseChatMessagesProps) => {
  const [messages, setMessages] = useState<ChatMessageEntity[]>([])
  const [lastMessageCount, setLastMessageCount] = useState(0)

  const hasSubmittedFirstMessage = useRef(false)
  const trpc = useTRPC()

  const { data: initialMessages, refetch } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: isStreaming ? false : 5000,
      }
    )
  )

  useEffect(() => {
    if (initialMessages) {
      const lastMessage = initialMessages[initialMessages.length - 1]
      const isUserFirstMsg =
        lastMessage?.isFirst && lastMessage.role === CHAT_ROLES.USER

      if (isUserFirstMsg && !hasSubmittedFirstMessage.current) {
        setMessages(initialMessages.slice(0, -1))
        setLastMessageCount(initialMessages.length - 1)
        onFirstMessageSubmit(lastMessage.content)
        hasSubmittedFirstMessage.current = true
      } else {
        const shouldUpdate =
          !isStreaming &&
          initialMessages.length !== lastMessageCount &&
          initialMessages.length > lastMessageCount &&
          !wasStreamAborted

        if (shouldUpdate) {
          const filteredMessages = initialMessages.filter(
            (msg) => !msg.id.startsWith('temp-streaming-')
          )

          setMessages(filteredMessages)
          setLastMessageCount(filteredMessages.length)
          onMessagesUpdate(filteredMessages)

          if (streamingCompleted) {
            onStreamingContentClear()
            onPendingMessageClear()
          }
        }
      }
    }
  }, [
    initialMessages,
    isStreaming,
    lastMessageCount,
    wasStreamAborted,
    streamingCompleted,
    onFirstMessageSubmit,
    onMessagesUpdate,
    onStreamingContentClear,
    onPendingMessageClear,
  ])

  const displayedMessages = useMemo((): DisplayedMessageEntity[] => {
    const allMessages: DisplayedMessageEntity[] = [...messages]

    if (pendingUserMessage) {
      allMessages.push(pendingUserMessage)
    }

    const shouldShowStreamingContent =
      streamingContent && (isStreaming || streamingCompleted)

    if (shouldShowStreamingContent) {
      const generationTime = isStreaming
        ? currentStreamingStartTime
          ? (Date.now() - currentStreamingStartTime) / 1000
          : undefined
        : finalGenerationTime || lastGenerationTime

      const streamingMessage = {
        id: `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        fragment: null,
        role: CHAT_ROLES.ASSISTANT,
        content: streamingContent,
        type: 'RESULT' as const,
        isStreaming: isStreaming,
        generationTime: generationTime ?? undefined,
      }
      allMessages.push(streamingMessage)
    }

    // Сортируем все сообщения по времени создания для обеспечения правильного порядка
    return allMessages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )
  }, [
    messages,
    pendingUserMessage,
    streamingContent,
    isStreaming,
    streamingCompleted,
    lastGenerationTime,
    currentStreamingStartTime,
    finalGenerationTime,
  ])

  const refetchMessages = useCallback(() => {
    setTimeout(() => {
      refetch().catch(console.error)
    }, 100)
  }, [refetch])

  return {
    messages,
    displayedMessages,
    refetchMessages,
  }
}
