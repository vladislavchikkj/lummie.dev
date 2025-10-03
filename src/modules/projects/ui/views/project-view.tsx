'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Fragment } from '@/generated/prisma'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Navbar } from '@/modules/home/ui/components/navbar/navbar'

import { MessagesContainer } from '../components/messages-container'
import { MessageForm } from '@/modules/projects/ui/components/message-form'
import { FragmentPanel } from '../components/fragment-panel'
import { useChatStreaming } from '../../hooks/use-chat-streaming'
import { useChatMessages } from '../../hooks/use-chat-messages'
import {
  ChatMessageEntity,
  AssistantMessageType,
  TabState,
} from '../../constants/chat'

interface Props {
  projectId: string
}

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabState, setTabState] = useState<TabState>('preview')
  const [assistantMessageType, setAssistantMessageType] =
    useState<AssistantMessageType>('CHAT')
  const [copied, setCopied] = useState(false)
  const [fragmentKey, setFragmentKey] = useState(0)
  const [pendingUserMessage, setPendingUserMessage] =
    useState<ChatMessageEntity | null>(null)

  const lastMessageWithFragmentIdRef = useRef<string | null>(null)

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
    onStreamingStart: () => {},
    onStreamingEnd: () => {},
    onMessageTypeChange: setAssistantMessageType,
    onContentUpdate: () => {},
    onStreamAborted: () => {},
    onStreamCompleted: () => {},
  })

  const { displayedMessages } = useChatMessages({
    projectId,
    isStreaming,
    streamingContent,
    streamingCompleted,
    wasStreamAborted,
    pendingUserMessage,
    onFirstMessageSubmit: (content: string) => {
      startStreaming(content, true)
    },
    onMessagesUpdate: () => {},
    onStreamingContentClear: clearStreamingContent,
    onPendingMessageClear: () => setPendingUserMessage(null),
  })

  const onSubmit = useCallback(
    async (message: string, isFirstMessage: boolean = false) => {
      if (isStreaming || !message.trim()) return

      // Создаем сообщение пользователя сразу
      const userMsg: ChatMessageEntity = {
        role: 'USER',
        content: message,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        fragment: null,
        type: 'RESULT',
      }

      // Показываем сообщение пользователя мгновенно
      if (!isFirstMessage) {
        setPendingUserMessage(userMsg)
      }

      // Запускаем стрим
      await startStreaming(message, isFirstMessage)
    },
    [isStreaming, startStreaming]
  )

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
    setActiveFragment(null)
  }, [])

  return (
    <div className="flex h-dvh flex-col pt-14">
      <Navbar showDesktopNav={false} applyScrollStyles={false} />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={activeFragment ? 35 : 100}
          minSize={25}
          className="relative flex min-h-0 flex-col overflow-hidden"
        >
          <ErrorBoundary
            fallback={<p className="text-destructive p-2">Messages Error</p>}
          >
            <Suspense fallback={null}>
              <MessagesContainer
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
                messages={displayedMessages || []}
                projectCreating={
                  assistantMessageType !== 'CHAT' && !wasStreamAborted
                }
                isStreaming={isStreaming}
              >
                <MessageForm
                  key={activeFragment ? 'narrow' : 'wide'}
                  projectId={projectId}
                  onStop={handleStopStreaming}
                  isStreaming={isStreaming}
                  onSubmit={onSubmit}
                />
              </MessagesContainer>
            </Suspense>
          </ErrorBoundary>

          <div className="from-background pointer-events-none absolute top-0 right-0 left-0 z-10 h-6 bg-gradient-to-b to-transparent" />
        </ResizablePanel>

        {activeFragment && (
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
