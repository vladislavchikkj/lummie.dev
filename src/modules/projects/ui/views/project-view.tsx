'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Fragment } from '@/generated/prisma'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { useIsMobile } from '@/hooks/use-mobile'

import { MessagesContainer } from '../components/messages-container'
import { MessageForm } from '@/modules/projects/ui/components/message-form'
import { FragmentPanel } from '../components/fragment-panel'
import { useChatStreaming } from '../../hooks/use-chat-streaming'
import { useChatMessages } from '../../hooks/use-chat-messages'
import {
  ChatMessageEntity,
  StreamChunkType,
  TabState,
  LocalImagePreview
} from '../../constants/chat'
import { useTRPCClient, useTRPC } from '@/trpc/client'
import { useQueryClient } from '@tanstack/react-query'
import type { ProcessedImage } from '@/lib/image-processing'
import { ImageGenerationResponse } from '@/modules/projects/types'

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const router = useRouter()
  const trpc = useTRPC()
  const isMobileQuery = useIsMobile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Проверяем существование проекта
  const { error: projectError } = useQuery({
    ...trpc.projects.getOne.queryOptions({ id: projectId }),
    retry: false // Не повторять запрос при ошибке
  })

  // Обработка случая, когда проект не найден
  useEffect(() => {
    if (projectError) {
      const errorMessage = projectError?.message || ''
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('NOT_FOUND')
      ) {
        toast.error('Project not found')
        router.push('/')
        return
      }
    }
  }, [projectError, router])

  // До монтирования считаем что это десктоп для консистентности SSR
  const isMobile = isMounted ? isMobileQuery : false
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabState, setTabState] = useState<TabState>('preview')
  const [assistantMessageType, setStreamChunkType] =
    useState<StreamChunkType>(StreamChunkType.Chat)
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
  const [editingGenImage, setEditingGenImage] = useState<Pick<ImageGenerationResponse, 'imageBase64'> | null>(null)
  const [isFragmentPanelOpen, setIsFragmentPanelOpen] = useState(true)

  const lastMessageWithFragmentIdRef = useRef<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    isStreaming,
    wasStreamAborted,
    streamingContent,
    streamingImage,
    streamingCompleted,
    startStreaming,
    stopStreaming,
    clearStreamingContent
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
    onMessageTypeChange: setStreamChunkType,
    onContentUpdate: () => {
    },
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
    streamingImage,
    wasStreamAborted,
    pendingUserMessage,
    lastGenerationTime,
    currentStreamingStartTime,
    finalGenerationTime,
    onFirstMessageSubmit: (content: string, images?: ProcessedImage[]) => {
      startStreaming(content, true, images)
    },
    onMessagesUpdate: () => {
    },
    onStreamingContentClear: clearStreamingContent,
    onPendingMessageClear: () => setPendingUserMessage(null)
  })

  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  // Invalidate usage status when streaming completes to update credits
  useEffect(() => {
    if (streamingCompleted && !wasStreamAborted && !isStreaming) {
      queryClient.invalidateQueries(trpc.usage.status.queryOptions())
    }
  }, [streamingCompleted, wasStreamAborted, isStreaming, queryClient, trpc])

  const projectCreating = assistantMessageType === StreamChunkType.Project && !wasStreamAborted

  useEffect(() => {
    if (projectCreating) {
      const tick = async () => {
        try {
          const { status } = await trpcClient.projects.status.query({
            id: projectId
          })
          if (status === 'COMPLETED' || status === 'ERROR') {
            stopStreaming()
            refetchMessages()
            if (pollingRef.current) {
              clearInterval(pollingRef.current)
              pollingRef.current = null
            }
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
    wasStreamAborted
  ])

  const onSubmit = useCallback(
    async (
      message: string,
      images?: ProcessedImage[],
      originalFiles?: File[],
      imageForEdit?: Pick<ImageGenerationResponse, 'imageBase64'> | null | undefined
    ) => {
      if (isStreaming || (!message.trim() && (!images || images.length === 0)))
        return

      const isFirstMessage = false

      if (!isFirstMessage) {
        let localPreviews: LocalImagePreview[] | undefined = undefined
        if (originalFiles && originalFiles.length > 0) {
          localPreviews = originalFiles.map((file) => ({
            url: URL.createObjectURL(file),
            file
          }))
        }

        const userMsg: ChatMessageEntity = {
          role: 'USER',
          content: message,
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          fragment: null,
          type: 'RESULT',
          localImagePreviews: localPreviews
        }

        setPendingUserMessage(userMsg)
      }

      await startStreaming(message, isFirstMessage, images, imageForEdit)
      setEditingMessage(null)
      setEditingGenImage(null)
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
      setIsFragmentPanelOpen(true) // Автоматически открываем панель при новом фрагменте
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
      setIsFragmentPanelOpen(false)
    } else {
      setIsFragmentPanelOpen(false)
      setActiveFragment(null)
    }
  }, [isMobile, isFragmentFullscreen])

  const handleEditUserMessage = useCallback((content: string) => {
    setEditingMessage(content)
  }, [])

  const handleEditAssistantImageMessage = useCallback((imageContent: string) => {
    if (imageContent) {
      setEditingGenImage({ imageBase64: imageContent })
    }
  }, [])

  const handleClearAssistantImageMessage = useCallback(() => {
    setEditingGenImage(null)
  }, [])

  const handleFragmentClick = useCallback(
    (fragment: Fragment | null) => {
      if (fragment) {
        setActiveFragment(fragment)
        setIsFragmentPanelOpen(true)
        if (isMobile) {
          setIsFragmentFullscreen(true)
        }
      } else {
        setActiveFragment(null)
        setIsFragmentPanelOpen(false)
        if (isMobile) {
          setIsFragmentFullscreen(false)
        }
      }
    },
    [isMobile]
  )

  if (
    isMobile &&
    isFragmentFullscreen &&
    isFragmentPanelOpen &&
    (activeFragment || projectCreating)
  ) {
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
          isGenerating={projectCreating}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={
            isFragmentPanelOpen &&
            (activeFragment || projectCreating) &&
            !isMobile
              ? 35
              : 100
          }
          minSize={25}
          className="relative flex min-h-0 flex-col overflow-hidden"
        >
          <ErrorBoundary
            fallback={<p className="text-destructive p-2">Messages Error</p>}
          >
            <Suspense fallback={null}>
              <MessagesContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={handleFragmentClick}
                messages={displayedMessages || []}
                projectCreating={projectCreating}
                isStreaming={isStreaming}
                isMobile={isMobile}
                onEditUserMessage={handleEditUserMessage}
                onEditAssistantImageMessage={handleEditAssistantImageMessage}
              >
                <MessageForm
                  key={activeFragment ? 'narrow' : 'wide'}
                  projectId={projectId}
                  onStop={handleStopStreaming}
                  isStreaming={isStreaming}
                  onSubmit={onSubmit}
                  initialValue={editingMessage || undefined}
                  generatedImage={editingGenImage}
                  clearGeneratedImage={handleClearAssistantImageMessage}
                />
              </MessagesContainer>
            </Suspense>
          </ErrorBoundary>

          <div
            className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b to-transparent" />
        </ResizablePanel>

        {isFragmentPanelOpen &&
          (activeFragment || projectCreating) &&
          !isMobile && (
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
                  isGenerating={projectCreating}
                />
              </ResizablePanel>
            </>
          )}
      </ResizablePanelGroup>
    </div>
  )
}
