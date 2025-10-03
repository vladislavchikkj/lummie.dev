'use client'

import {
  Copy,
  ExternalLinkIcon,
  RefreshCcwIcon,
  CodeIcon,
  EyeIcon,
  FileCode2,
  Construction,
  XIcon,
} from 'lucide-react'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Fragment } from '@/generated/prisma'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'

import { MessagesContainer } from '../components/messages-container'
import { FragmentWeb } from '../components/fragment-web'
import { FileExplorer } from '@/components/file-explorer/file-explorer'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/modules/home/ui/components/navbar/navbar'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC, useTRPCClient } from '@/trpc/client'
import { MessageForm } from '@/modules/projects/ui/components/message-form'
import { TRPCClientError } from '@trpc/client'

interface Props {
  projectId: string
}

const PreviewPlaceholder = () => (
  <div className="bg-muted/40 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed">
    <Construction size={48} strokeWidth={1} />
    <p className="mt-4 text-center text-lg font-medium">
      Preview will appear here
    </p>
    <p className="text-sm">Generate or select a fragment to see the result.</p>
  </div>
)

const CodePlaceholder = () => (
  <div className="bg-muted/40 text-muted-foreground flex h-full w-full flex-col items-center justify-center rounded-lg border border-dashed">
    <FileCode2 size={48} strokeWidth={1} />
    <p className="mt-4 text-center text-lg font-medium">No code to display</p>
    <p className="text-sm">Select a fragment to browse its files.</p>
  </div>
)

export const CHAT_ROLES = {
  USER: 'USER' as const,
  ASSISTANT: 'ASSISTANT' as const,
}

export const CHAT_MESSAGE_TYPES = {
  ERROR: 'ERROR' as const,
  RESULT: 'RESULT' as const,
}

export interface ChatMessageEntity {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT'
  type: 'RESULT' | 'ERROR'
  createdAt: Date
  fragment: Fragment | null
  isFirst?: boolean
}

type DisplayedMessageEntity = ChatMessageEntity & { isStreaming?: boolean }

export const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
  const [tabState, setTabState] = useState<'preview' | 'code'>('preview')
  const [assistantMessageType, setAssistantMessageType] = useState<
    'CHAT' | 'PROJECT'
  >('CHAT')

  const [copied, setCopied] = useState(false)
  const [fragmentKey, setFragmentKey] = useState(0)

  const hasSubmittedFirstMessage = useRef(false)
  const lastMessageWithFragmentIdRef = useRef<string | null>(null)

  const [messages, setMessages] = useState<ChatMessageEntity[]>([])
  const [streamingContent, setStreamingContent] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [pendingUserMessage, setPendingUserMessage] =
    useState<ChatMessageEntity | null>(null)
  const [lastMessageCount, setLastMessageCount] = useState<number>(0)
  const [wasStreamAborted, setWasStreamAborted] = useState<boolean>(false)
  const [isAborting, setIsAborting] = useState<boolean>(false)
  const [streamingCompleted, setStreamingCompleted] = useState<boolean>(false)

  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const { data: initialMessages, refetch } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId: projectId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: isStreaming ? false : 5000,
      }
    )
  )

  const onSubmit = useCallback(
    async (message: string, isFirstMessage: boolean = false) => {
      console.log('🚀 onSubmit called:', {
        message: message.substring(0, 50),
        isFirstMessage,
        isStreaming,
      })

      if (isStreaming || !message.trim()) return

      // Создаем новый AbortController только если предыдущий был очищен
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController()
      }

      const userMsg: ChatMessageEntity = {
        role: CHAT_ROLES.USER,
        content: message,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        fragment: null,
        type: CHAT_MESSAGE_TYPES.RESULT,
      }

      if (!isFirstMessage) {
        setPendingUserMessage(userMsg)
      }

      console.log('📝 Setting streaming state:', {
        isStreaming: true,
        streamingContent: '',
        wasStreamAborted: false,
        currentMessagesCount: messages.length,
      })
      setIsStreaming(true)
      setStreamingContent('')
      setWasStreamAborted(false)
      setStreamingCompleted(false)

      try {
        const stream = await trpcClient.projects.handleUserMessage.mutate(
          {
            projectId: projectId,
            value: message,
            isFirst: isFirstMessage,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        )

        for await (const { content, type } of stream) {
          console.log('📦 Stream chunk received:', {
            content: content.substring(0, 50),
            type,
          })
          setAssistantMessageType((prev) => {
            if (type !== prev) {
              console.log('🔄 Assistant message type changed:', {
                from: prev,
                to: type,
              })
              return type
            }
            return prev
          })
          setStreamingContent((prev) => {
            const newContent = prev + content
            console.log('📝 Streaming content updated:', {
              prevLength: prev.length,
              newLength: newContent.length,
              content: newContent.substring(0, 100),
            })
            return newContent
          })
        }
      } catch (error) {
        // Проверяем различные типы ошибок прерывания
        const isAbortError =
          (error instanceof TRPCClientError &&
            (error.data?.code === 'CLIENT_CLOSED_REQUEST' ||
              error.cause?.name === 'AbortError')) ||
          (error instanceof Error && error.name === 'AbortError') ||
          (error as { name?: string })?.name === 'AbortError'

        if (isAbortError) {
          console.log('🛑 Stream aborted by user:', { wasStreamAborted: true })
          setWasStreamAborted(true)
          // Не логируем ошибки прерывания как ошибки
          console.debug('Stream aborted by user')
        } else {
          console.error('Streaming error:', error)
        }
      } finally {
        console.log('🏁 Finally block:', {
          isStreaming: false,
          wasStreamAborted,
          streamingContentLength: streamingContent.length,
        })

        setIsStreaming(false)
        setIsAborting(false)

        // Безопасно очищаем abort controller
        if (abortControllerRef.current) {
          abortControllerRef.current = null
        }

        // Не меняем assistantMessageType если стрим был прерван
        // setAssistantMessageType остается как есть

        // Не делаем refetch сразу - это вызывает перерендер и пропадание стрима
        // НЕ очищаем pendingUserMessage сразу - он должен оставаться до получения данных с сервера

        // Отмечаем что стрим завершен, но НЕ очищаем streamingContent
        // чтобы он оставался видимым до получения данных с сервера
        setStreamingCompleted(true)
        if (wasStreamAborted) {
          setWasStreamAborted(false)
        }

        // Делаем refetch в фоне без блокировки UI
        // Но с задержкой, чтобы дать время UI обновиться
        setTimeout(() => {
          refetch().catch(console.error)
        }, 100)
      }
    },
    [
      projectId,
      isStreaming,
      refetch,
      trpcClient.projects.handleUserMessage,
      wasStreamAborted,
      streamingContent,
      messages.length,
    ]
  )

  useEffect(() => {
    console.log('🔄 useEffect for initialMessages:', {
      hasInitialMessages: !!initialMessages,
      initialMessagesLength: initialMessages?.length,
      isStreaming,
      lastMessageCount,
      hasSubmittedFirstMessage: hasSubmittedFirstMessage.current,
    })

    if (initialMessages) {
      const lastMessage = initialMessages[initialMessages.length - 1]
      const isUserFirstMsg =
        lastMessage?.isFirst && lastMessage.role === CHAT_ROLES.USER

      if (isUserFirstMsg && !hasSubmittedFirstMessage.current) {
        console.log(
          '🚀 Processing first message:',
          lastMessage.content.substring(0, 50)
        )
        setMessages(initialMessages.slice(0, -1))
        setLastMessageCount(initialMessages.length - 1)
        onSubmit(lastMessage.content, true)
        hasSubmittedFirstMessage.current = true
      } else {
        // Обновляем сообщения только если:
        // 1. Не идет стриминг И
        // 2. Количество сообщений изменилось (новые сообщения появились)
        // 3. И НЕ было прерывания стрима (чтобы избежать лишних обновлений)
        const shouldUpdate =
          !isStreaming &&
          initialMessages.length !== lastMessageCount &&
          initialMessages.length > lastMessageCount &&
          !wasStreamAborted

        console.log('📊 Message update decision:', {
          shouldUpdate,
          isStreaming,
          initialMessagesLength: initialMessages.length,
          lastMessageCount,
          lengthChanged: initialMessages.length !== lastMessageCount,
          lengthIncreased: initialMessages.length > lastMessageCount,
        })

        if (shouldUpdate) {
          console.log('✅ Updating messages from server:', {
            oldCount: messages.length,
            newCount: initialMessages.length,
            streamingContent: streamingContent.substring(0, 50),
            wasStreamAborted,
            streamingCompleted,
          })

          // Удаляем временные стрим-сообщения перед обновлением
          const filteredMessages = initialMessages.filter(
            (msg) => !msg.id.startsWith('temp-streaming-')
          )

          setMessages(filteredMessages)
          setLastMessageCount(filteredMessages.length)

          // Очищаем streamingContent и pendingUserMessage после получения данных с сервера
          if (streamingCompleted) {
            setStreamingContent('')
            setStreamingCompleted(false)
            setPendingUserMessage(null)
          }
        } else {
          console.log('⏸️ Skipping message update due to streaming')
        }
      }
    }
  }, [
    initialMessages,
    onSubmit,
    isStreaming,
    lastMessageCount,
    wasStreamAborted,
    messages.length,
    streamingContent,
    streamingCompleted,
  ])

  const onRefreshPreview = () => {
    setFragmentKey((prev) => prev + 1)
  }

  const handleStopStreaming = () => {
    console.log('🛑 handleStopStreaming called:', {
      hasAbortController: !!abortControllerRef.current,
      isAborted: abortControllerRef.current?.signal.aborted,
      isStreaming,
      isAborting,
      streamingContentLength: streamingContent.length,
    })

    if (
      abortControllerRef.current &&
      !abortControllerRef.current.signal.aborted &&
      isStreaming &&
      !isAborting
    ) {
      console.log('🛑 Aborting stream...')
      setIsAborting(true)
      try {
        abortControllerRef.current.abort()
        console.log('✅ Stream abort signal sent')
      } catch (error) {
        // Игнорируем ошибки при прерывании стрима
        console.debug('Stream aborted:', error)
      }
    } else {
      console.log('❌ Cannot abort stream:', {
        hasAbortController: !!abortControllerRef.current,
        isAborted: abortControllerRef.current?.signal.aborted,
        isStreaming,
        isAborting,
      })
    }
  }

  const handleCopyUrl = () => {
    if (!activeFragment?.sandboxUrl) return
    navigator.clipboard.writeText(activeFragment.sandboxUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayedMessages = useMemo((): DisplayedMessageEntity[] => {
    console.log('🎭 displayedMessages recalculated:', {
      messagesCount: messages.length,
      pendingUserMessage: !!pendingUserMessage,
      streamingContent: streamingContent.substring(0, 50),
      streamingContentLength: streamingContent.length,
      isStreaming,
      wasStreamAborted,
    })

    const allMessages: DisplayedMessageEntity[] = [...messages]

    if (pendingUserMessage) {
      allMessages.push(pendingUserMessage)
    }

    // Показываем стриминг контент если:
    // 1. Идет активный стрим ИЛИ
    // 2. Есть контент от завершенного стрима (пока не пришли данные с сервера)
    const shouldShowStreamingContent =
      streamingContent && (isStreaming || streamingCompleted)

    if (shouldShowStreamingContent) {
      const streamingMessage = {
        id: `streaming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        fragment: null,
        role: CHAT_ROLES.ASSISTANT,
        content: streamingContent,
        type: CHAT_MESSAGE_TYPES.RESULT,
        isStreaming: isStreaming, // Показываем анимацию только во время активного стрима
      }
      console.log('📤 Adding streaming message to display:', {
        content: streamingContent.substring(0, 100),
        isStreaming,
      })
      allMessages.push(streamingMessage)
    } else {
      console.log('❌ Not showing streaming content:', {
        hasStreamingContent: !!streamingContent,
        isStreaming,
        wasStreamAborted,
        messagesCount: messages.length,
      })
    }

    console.log('📋 Final displayedMessages count:', allMessages.length)
    return allMessages
  }, [
    messages,
    pendingUserMessage,
    streamingContent,
    isStreaming,
    wasStreamAborted,
    streamingCompleted,
  ])

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
  }, [displayedMessages, setActiveFragment])

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
                  // onSubmit={() => {}}
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
              <Tabs
                className="flex h-full flex-col gap-0"
                defaultValue="preview"
                value={tabState}
                onValueChange={(value) =>
                  setTabState(value as 'preview' | 'code')
                }
              >
                <div className="flex h-14 flex-none items-center justify-between gap-x-2 rounded-tl-lg border-t border-b border-l px-2">
                  <TabsList className="h-9 rounded-md border bg-transparent p-1">
                    <TabsTrigger value="preview" className="h-full text-sm">
                      <EyeIcon className="size-4" />
                    </TabsTrigger>
                    <TabsTrigger value="code" className="h-full text-sm">
                      <CodeIcon className="size-4" />
                    </TabsTrigger>
                  </TabsList>

                  {tabState === 'preview' && activeFragment && (
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-x-2">
                      <div className="group bg-muted/60 relative flex h-9 flex-1 items-center gap-2 rounded-md border">
                        <Hint text="Refresh Preview" side="bottom">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={onRefreshPreview}
                          >
                            <RefreshCcwIcon className="size-4" />
                          </Button>
                        </Hint>
                        <span className="text-muted-foreground truncate font-mono text-sm">
                          {activeFragment.sandboxUrl ?? 'URL not available'}
                        </span>
                        <Hint
                          text={copied ? 'Copied!' : 'Copy URL'}
                          side="bottom"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2"
                            onClick={handleCopyUrl}
                            disabled={!activeFragment.sandboxUrl}
                          >
                            <Copy className="size-4" />
                          </Button>
                        </Hint>
                      </div>

                      <Hint text="Open in a new tab" side="bottom">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!activeFragment.sandboxUrl}
                          asChild
                        >
                          <a
                            href={activeFragment.sandboxUrl ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLinkIcon className="size-4" />
                          </a>
                        </Button>
                      </Hint>
                    </div>
                  )}
                  <div className="flex h-full w-fit items-center justify-center gap-2">
                    <Separator orientation="vertical" className="h-6" />

                    <Hint text="Close Panel" side="bottom">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveFragment(null)}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </Hint>
                  </div>
                </div>

                <TabsContent
                  value="preview"
                  className="flex-1 overflow-auto border-l"
                >
                  {activeFragment ? (
                    <FragmentWeb
                      data={activeFragment}
                      refreshKey={fragmentKey}
                    />
                  ) : (
                    <PreviewPlaceholder />
                  )}
                </TabsContent>

                <TabsContent
                  value="code"
                  className="flex-1 overflow-auto border-l"
                >
                  {activeFragment?.files ? (
                    <FileExplorer
                      files={activeFragment.files as { [path: string]: string }}
                      projectId={projectId}
                    />
                  ) : (
                    <div className="h-full p-4">
                      <CodePlaceholder />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
