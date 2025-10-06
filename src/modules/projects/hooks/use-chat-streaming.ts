import { useCallback, useRef, useState } from 'react'
import { useTRPCClient } from '@/trpc/client'
import { TRPCClientError } from '@trpc/client'

interface UseChatStreamingProps {
  projectId: string
  onStreamingStart: () => void
  onStreamingEnd: () => void
  onMessageTypeChange: (type: 'CHAT' | 'PROJECT') => void
  onContentUpdate: (content: string) => void
  onStreamAborted: () => void
  onStreamCompleted: () => void
}

export const useChatStreaming = ({
  projectId,
  onStreamingStart,
  onStreamingEnd,
  onMessageTypeChange,
  onContentUpdate,
  onStreamAborted,
  onStreamCompleted,
}: UseChatStreamingProps) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAborting, setIsAborting] = useState(false)
  const [wasStreamAborted, setWasStreamAborted] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingCompleted, setStreamingCompleted] = useState(false)

  const trpcClient = useTRPCClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const startStreaming = useCallback(
    async (message: string, isFirstMessage: boolean = false) => {
      if (isStreaming || !message.trim()) return

      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController()
      }

      // Reset all streaming state before starting
      setIsStreaming(true)
      setStreamingContent('')
      setWasStreamAborted(false)
      setStreamingCompleted(false)
      onStreamingStart()

      try {
        const stream = await trpcClient.projects.handleUserMessage.mutate(
          {
            projectId,
            value: message,
            isFirst: isFirstMessage,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        )

        for await (const { content, type } of stream) {
          onMessageTypeChange(type)
          setStreamingContent((prev) => {
            const newContent = prev + content
            onContentUpdate(newContent)
            return newContent
          })
        }
      } catch (error) {
        const isAbortError =
          (error instanceof TRPCClientError &&
            (error.data?.code === 'CLIENT_CLOSED_REQUEST' ||
              error.cause?.name === 'AbortError')) ||
          (error instanceof Error && error.name === 'AbortError') ||
          (error as { name?: string })?.name === 'AbortError'

        if (isAbortError) {
          setWasStreamAborted(true)
          onStreamAborted()
          console.debug('Stream aborted by user')
        } else {
          console.error('Streaming error:', error)
        }
      } finally {
        // Mark streaming as completed first, then stop streaming
        setStreamingCompleted(true)
        onStreamCompleted()

        setIsStreaming(false)
        setIsAborting(false)
        onStreamingEnd()

        if (abortControllerRef.current) {
          abortControllerRef.current = null
        }

        if (wasStreamAborted) {
          setWasStreamAborted(false)
        }
      }
    },
    [
      isStreaming,
      projectId,
      trpcClient.projects.handleUserMessage,
      onStreamingStart,
      onStreamingEnd,
      onMessageTypeChange,
      onContentUpdate,
      onStreamAborted,
      onStreamCompleted,
      wasStreamAborted,
    ]
  )

  const stopStreaming = useCallback(() => {
    if (
      abortControllerRef.current &&
      !abortControllerRef.current.signal.aborted &&
      isStreaming &&
      !isAborting
    ) {
      setIsAborting(true)
      try {
        abortControllerRef.current.abort()
      } catch (error) {
        console.debug('Stream aborted:', error)
      }
    }
  }, [isStreaming, isAborting])

  const clearStreamingContent = useCallback(() => {
    setStreamingContent('')
    setStreamingCompleted(false)
  }, [])

  return {
    isStreaming,
    isAborting,
    wasStreamAborted,
    streamingContent,
    streamingCompleted,
    startStreaming,
    stopStreaming,
    clearStreamingContent,
  }
}
