'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Fragment } from '@/generated/prisma'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { useIsMobile } from '@/hooks/use-mobile'

import { MessagesContainer } from '../components/messages-container'
import { MessageForm } from '@/modules/projects/ui/components/message-form'
import { FragmentPanel } from '../components/fragment-panel'
import { useChatStreaming } from '../../hooks/use-chat-streaming'
import { useChatMessages } from '../../hooks/use-chat-messages'
import {
  ChatMessageEntity,
  AssistantMessageType,
  TabState,
  LocalImagePreview,
} from '../../constants/chat'
import { useTRPCClient } from '@/trpc/client'
import type { ProcessedImage } from '@/lib/image-processing'

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const isMobile = useIsMobile()
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabState, setTabState] = useState<TabState>('preview')
  const [assistantMessageType, setAssistantMessageType] =
    useState<AssistantMessageType>('CHAT')
  const [copied, setCopied] = useState(false)
  const [fragmentKey, setFragmentKey] = useState(0)
  const [pendingUserMessage, setPendingUserMessage] =
    useState<ChatMessageEntity | null>(null)
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(
    null
  )
  const [currentStreamingStartTime, setCurrentStreamingStartTime] = useState<
    number | null
  >(null)
  const streamingStartTimeRef = useRef<number | null>(null)
  const [finalGenerationTime, setFinalGenerationTime] = useState<number | null>(
    null
  )
  const [isFragmentFullscreen, setIsFragmentFullscreen] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)

  const lastMessageWithFragmentIdRef = useRef<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    isStreaming,
    wasStreamAborted,
    streamingContent,
    streamingCompleted,
    startStreaming,
    stopStreaming,
    clearStreamingContent,
  } = useChatStreaming({
    projectId,
    onStreamingStart: () => {
      const startTime = Date.now()
      setCurrentStreamingStartTime(startTime)
      streamingStartTimeRef.current = startTime
    },
    onStreamingEnd: () => {
      const startTime =
        streamingStartTimeRef.current || currentStreamingStartTime
      if (startTime) {
        const finalTime = (Date.now() - startTime) / 1000
        setLastGenerationTime(finalTime)
        setFinalGenerationTime(finalTime)
      }
      setCurrentStreamingStartTime(null)
      streamingStartTimeRef.current = null
    },
    onMessageTypeChange: setAssistantMessageType,
    onContentUpdate: () => {},
    onStreamAborted: () => {
      setCurrentStreamingStartTime(null)
      streamingStartTimeRef.current = null
      setLastGenerationTime(null)
      setFinalGenerationTime(null)
    },
    onStreamCompleted: () => {
      const startTime =
        streamingStartTimeRef.current || currentStreamingStartTime
      if (startTime) {
        const finalTime = (Date.now() - startTime) / 1000
        setLastGenerationTime(finalTime)
        setFinalGenerationTime(finalTime)
      }
      setCurrentStreamingStartTime(null)
      streamingStartTimeRef.current = null

      // Refetch messages after streaming completes to ensure proper order
      setTimeout(() => {
        refetchMessages()
      }, 500)
    },
  })

  const { displayedMessages, refetchMessages } = useChatMessages({
    projectId,
    isStreaming,
    streamingContent,
    streamingCompleted,
    wasStreamAborted,
    pendingUserMessage,
    lastGenerationTime,
    currentStreamingStartTime,
    finalGenerationTime,
    onFirstMessageSubmit: (content: string, images?: ProcessedImage[]) => {
      startStreaming(content, true, images)
    },
    onMessagesUpdate: () => {},
    onStreamingContentClear: clearStreamingContent,
    onPendingMessageClear: () => setPendingUserMessage(null),
  })

  const trpcClient = useTRPCClient()

  useEffect(() => {
    if (assistantMessageType !== 'CHAT' && !wasStreamAborted) {
      const tick = async () => {
        try {
          const { status } = await trpcClient.projects.status.query({
            id: projectId,
          })
          if (status === 'COMPLETED' || status === 'ERROR') {
            stopStreaming()
            refetchMessages()
            // setAssistantMessageType('CHAT'); // Optional: Reset to chat mode if needed
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
            // // Optional: Update generation times or other states if required
            // const finalTime = currentStreamingStartTime ? (Date.now() - currentStreamingStartTime) / 1000 : null;
            // if (finalTime) {
            //   setLastGenerationTime(finalTime);
            //   setFinalGenerationTime(finalTime);
            // }
          }
        } catch (error) {
          console.error('Error polling project status:', error)
        }
      }

      // Start polling
      tick()
      pollingRef.current = setInterval(tick, 4000)

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assistantMessageType,
    isStreaming,
    projectId,
    stopStreaming,
    trpcClient,
    wasStreamAborted,
  ])

  const onSubmit = useCallback(
    async (
      message: string,
      images?: ProcessedImage[],
      originalFiles?: File[]
    ) => {
      if (isStreaming || (!message.trim() && (!images || images.length === 0)))
        return

      const isFirstMessage = false

      if (!isFirstMessage) {
        let localPreviews: LocalImagePreview[] | undefined = undefined
        if (originalFiles && originalFiles.length > 0) {
          localPreviews = originalFiles.map((file) => ({
            url: URL.createObjectURL(file),
            file,
          }))
        }

        const userMsg: ChatMessageEntity = {
          role: 'USER',
          content: message,
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          fragment: null,
          type: 'RESULT',
          localImagePreviews: localPreviews,
        }

        setPendingUserMessage(userMsg)
      }

      await startStreaming(message, isFirstMessage, images)
      setEditingMessage(null)
    },
    [isStreaming, startStreaming]
  )

  useEffect(() => {
    return () => {
      if (pendingUserMessage?.localImagePreviews) {
        pendingUserMessage.localImagePreviews.forEach((preview) => {
          URL.revokeObjectURL(preview.url)
        })
      }
    }
  }, [pendingUserMessage])

  useEffect(() => {
    const lastMessageWithFragment = displayedMessages.findLast(
      (message) => !!message.fragment
    )

    if (
      lastMessageWithFragment?.fragment &&
      lastMessageWithFragment.id !== lastMessageWithFragmentIdRef.current
    ) {
      setActiveFragment(lastMessageWithFragment.fragment)
      lastMessageWithFragmentIdRef.current = lastMessageWithFragment.id
    }
  }, [displayedMessages])

  const onRefreshPreview = useCallback(() => {
    setFragmentKey((prev) => prev + 1)
  }, [])

  const handleStopStreaming = useCallback(() => {
    stopStreaming()
  }, [stopStreaming])

  const handleCopyUrl = useCallback(() => {
    if (!activeFragment?.sandboxUrl) return
    navigator.clipboard.writeText(activeFragment.sandboxUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeFragment?.sandboxUrl])

  const handleTabChange = useCallback((value: TabState) => {
    setTabState(value)
  }, [])

  const handleClose = useCallback(() => {
    if (isMobile && isFragmentFullscreen) {
      setIsFragmentFullscreen(false)
    } else {
      setActiveFragment(null)
    }
  }, [isMobile, isFragmentFullscreen])

  const handleEditUserMessage = useCallback((content: string) => {
    setEditingMessage(content)
  }, [])

  const handleFragmentClick = useCallback(
    (fragment: Fragment | null) => {
      if (fragment) {
        setActiveFragment(fragment)
        if (isMobile) {
          setIsFragmentFullscreen(true)
        }
      } else {
        setActiveFragment(null)
        if (isMobile) {
          setIsFragmentFullscreen(false)
        }
      }
    },
    [isMobile]
  )

  if (isMobile && isFragmentFullscreen && activeFragment) {
    return (
      <div className="bg-background flex h-full flex-col overflow-hidden">
        <FragmentPanel
          activeFragment={activeFragment}
          tabState={tabState}
          fragmentKey={fragmentKey}
          projectId={projectId}
          copied={copied}
          onTabChange={handleTabChange}
          onRefreshPreview={onRefreshPreview}
          onCopyUrl={handleCopyUrl}
          onClose={handleClose}
          isMobile={true}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={activeFragment && !isMobile ? 35 : 100}
          minSize={25}
          className="relative flex min-h-0 flex-col overflow-hidden"
        >
          <ErrorBoundary
            fallback={<p className="text-destructive p-2">Messages Error</p>}
          >
            <Suspense fallback={null}>
              <MessagesContainer
                activeFragment={activeFragment}
                setActiveFragment={handleFragmentClick}
                messages={displayedMessages || []}
                projectCreating={
                  assistantMessageType !== 'CHAT' && !wasStreamAborted
                }
                isStreaming={isStreaming}
                isMobile={isMobile}
                onEditUserMessage={handleEditUserMessage}
              >
                <MessageForm
                  key={activeFragment ? 'narrow' : 'wide'}
                  projectId={projectId}
                  onStop={handleStopStreaming}
                  isStreaming={isStreaming}
                  onSubmit={onSubmit}
                  initialValue={editingMessage || undefined}
                />
              </MessagesContainer>
            </Suspense>
          </ErrorBoundary>

          <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b to-transparent" />
        </ResizablePanel>

        {activeFragment && !isMobile && (
          <>
            <ResizableHandle withHandle className="bg-transparent" />
            <ResizablePanel defaultSize={65} minSize={50} className="min-h-0">
              <FragmentPanel
                activeFragment={activeFragment}
                tabState={tabState}
                fragmentKey={fragmentKey}
                projectId={projectId}
                copied={copied}
                onTabChange={handleTabChange}
                onRefreshPreview={onRefreshPreview}
                onCopyUrl={handleCopyUrl}
                onClose={handleClose}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
