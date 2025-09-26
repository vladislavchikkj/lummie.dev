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

  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const { data: initialMessages, refetch } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId: projectId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: 5000,
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
        id: projectId,
        createdAt: new Date(),
        fragment: null,
        type: CHAT_MESSAGE_TYPES.RESULT,
      }

      if (!isFirstMessage) {
        setPendingUserMessage(userMsg)
      }

      setIsStreaming(true)
      setStreamingContent('')

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
          setAssistantMessageType((prev) => {
            if (type !== prev) {
              return type
            }
            return prev
          })
          setStreamingContent((prev) => prev + content)
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
        setAssistantMessageType('PROJECT')
        await refetch()

        setPendingUserMessage(null)
        setStreamingContent('')
      }
    },
    [projectId, isStreaming, refetch, trpcClient.projects.handleUserMessage]
  )

  useEffect(() => {
    if (initialMessages) {
      const lastMessage = initialMessages[initialMessages.length - 1]
      const isUserFirstMsg =
        lastMessage?.isFirst && lastMessage.role === CHAT_ROLES.USER
      if (isUserFirstMsg && !hasSubmittedFirstMessage.current) {
        setMessages(initialMessages.slice(0, -1))
        onSubmit(lastMessage.content, true)
        hasSubmittedFirstMessage.current = true
      } else {
        setMessages(initialMessages)
      }
    }
  }, [initialMessages, onSubmit])

  const onRefreshPreview = () => {
    setFragmentKey((prev) => prev + 1)
  }

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleCopyUrl = () => {
    if (!activeFragment?.sandboxUrl) return
    navigator.clipboard.writeText(activeFragment.sandboxUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayedMessages = useMemo((): DisplayedMessageEntity[] => {
    const allMessages: DisplayedMessageEntity[] = [...messages]

    if (pendingUserMessage) {
      allMessages.push(pendingUserMessage)
    }

    if (streamingContent || isStreaming) {
      allMessages.push({
        id: projectId,
        createdAt: new Date(),
        fragment: null,
        role: CHAT_ROLES.ASSISTANT,
        content: streamingContent || '',
        type: CHAT_MESSAGE_TYPES.RESULT,
        isStreaming: true,
      })
    }
    return allMessages
  }, [messages, pendingUserMessage, streamingContent, isStreaming, projectId])

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
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
                messages={displayedMessages || []}
                projectCreating={assistantMessageType !== 'CHAT'}
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
