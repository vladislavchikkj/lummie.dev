import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
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
  const { userId } = useAuth()

  const { data: initialMessages, refetch } = useQuery({
    ...trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        // Disable automatic refetching during streaming to prevent race conditions
        refetchInterval: false,
      }
    ),
    enabled: !!userId, // Выполнять запрос только если пользователь авторизован
  })

  useEffect(() => {
    if (initialMessages) {
      const lastMessage = initialMessages[initialMessages.length - 1]
      const isUserFirstMsg =
        lastMessage?.isFirst && lastMessage.role === CHAT_ROLES.USER

      if (isUserFirstMsg && !hasSubmittedFirstMessage.current) {
        // For first message, add it to messages so it shows immediately
        // Then trigger streaming
        setMessages(initialMessages)
        setLastMessageCount(initialMessages.length)
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
            onPendingMessageClear()

            // Check if this is the AI response being saved (not just user message)
            const hasAIMessage = filteredMessages.some(
              (msg) => msg.role === CHAT_ROLES.ASSISTANT
            )

            if (hasAIMessage) {
              onStreamingContentClear()
            }
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

    // Show pending user message if it exists (for non-first messages)
    // For first messages, we'll handle them through the first message logic
    if (pendingUserMessage) {
      allMessages.push(pendingUserMessage)
    }

    // Show streaming content if we have content and are streaming or completed
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

    const sortedMessages = allMessages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )

    return sortedMessages
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
