import { Fragment, MessageRole, MessageType } from '@/generated/prisma'
import { cn } from '@/lib/utils'
import { memo, useState } from 'react'
import {
  ChevronRightIcon,
  Code2Icon,
  Copy,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { Response } from '@/components/ui/shadcn-io/ai/response'
import { Tool } from '@/components/ui/shadcn-io/ai/tool'
import { Reasoning } from '@/components/ui/shadcn-io/ai/reasoning'

interface FragmentCardProps {
  fragment: Fragment
  isActiveFragment: boolean
  onFragmentClick: (fragment: Fragment | null) => void
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        'group bg-muted/50 relative flex w-full items-center gap-2 rounded-lg border-0 p-2 text-start transition-all duration-200 ease-out',
        'hover:bg-muted/70 active:scale-[0.98]',
        'sm:w-fit sm:gap-3 sm:p-2.5',
        isActiveFragment &&
          'bg-primary/10 text-foreground ring-primary/20 ring-1'
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon
        className={cn(
          'size-3.5 transition-colors sm:size-4',
          isActiveFragment
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'line-clamp-1 text-xs font-medium transition-colors sm:text-sm',
            isActiveFragment
              ? 'text-foreground'
              : 'text-foreground/80 group-hover:text-foreground'
          )}
        >
          {fragment.title}
        </span>
        <span
          className={cn(
            'text-xs transition-colors',
            isActiveFragment
              ? 'text-foreground/60'
              : 'text-muted-foreground group-hover:text-muted-foreground/80'
          )}
        >
          Preview
        </span>
      </div>

      <ChevronRightIcon
        className={cn(
          'size-3 transition-all duration-200 group-hover:translate-x-0.5 sm:size-3.5',
          isActiveFragment
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
    </button>
  )
}

interface AssistantMessageActionsProps {
  content: string
  isStreaming?: boolean
  generationTime?: number | null
}

const AssistantMessageActions = ({
  content,
  isStreaming = false,
  generationTime,
}: AssistantMessageActionsProps) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }

  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false)
    }
    setIsLiked(!isLiked)
  }

  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false)
    }
    setIsDisliked(!isDisliked)
  }

  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center gap-1 transition-opacity',
        isStreaming
          ? 'opacity-0'
          : 'opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8',
          isLiked && ''
        )}
        onClick={handleLike}
      >
        <ThumbsUp
          className={cn(
            'h-3.5 w-3.5 transition-all duration-200 sm:h-4 sm:w-4',
            isLiked && 'fill-current'
          )}
        />
        <span className="sr-only">Good response</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 transition-all duration-200 hover:scale-110 sm:h-8 sm:w-8',
          isDisliked && ''
        )}
        onClick={handleDislike}
      >
        <ThumbsDown
          className={cn(
            'h-3.5 w-3.5 transition-all duration-200 sm:h-4 sm:w-4',
            isDisliked && 'fill-current'
          )}
        />
        <span className="sr-only">Bad response</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 sm:h-8 sm:w-8"
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only">Copy</span>
      </Button>
      {generationTime !== undefined && generationTime !== null && (
        <span className="text-muted-foreground/70 bg-muted/50 rounded px-1.5 py-0.5 text-xs sm:px-2 sm:py-1">
          {generationTime.toFixed(1)}s
        </span>
      )}
    </div>
  )
}

interface UserMessageActionsProps {
  content: string
}

const UserMessageActions = ({ content }: UserMessageActionsProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }

  return (
    <div className="text-muted-foreground flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 transition-all duration-200 hover:bg-transparent sm:h-8 sm:w-8"
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="sr-only">Copy</span>
      </Button>
    </div>
  )
}

interface MessageCardProps {
  content: string
  role: MessageRole
  fragment: Fragment | null
  createdAt: Date
  isActiveFragment: boolean
  onFragmentClick: (fragment: Fragment | null) => void
  type: MessageType
  isStreaming?: boolean
  generationTime?: number | null
}

export const MessageCard = memo(
  ({
    content,
    role,
    fragment,
    isActiveFragment,
    onFragmentClick,
    type,
    isStreaming = false,
    generationTime,
  }: MessageCardProps) => {
    const messageRole = role.toLowerCase() as 'user' | 'assistant'

    return (
      <>
        {role === 'USER' && (
          <div className="group mb-2 flex w-full justify-end">
            <div className="flex items-center gap-2">
              <UserMessageActions content={content} />
              <Message from={messageRole}>
                <MessageContent className="flex flex-col">
                  <div className="text-base break-words sm:text-base">
                    {content}
                  </div>
                </MessageContent>
              </Message>
            </div>
          </div>
        )}
        {role === 'ASSISTANT' && (
          <div className="group mb-2 flex w-full">
            <Message from={messageRole}>
              <MessageContent className="flex flex-col">
                <Response
                  className="flex-1 text-base sm:text-base"
                  useHardenedMarkdown={false}
                  parseIncompleteMarkdown={false}
                >
                  {content}
                </Response>
                {fragment && type === 'RESULT' && (
                  <Tool className="mt-2">
                    <FragmentCard
                      fragment={fragment}
                      isActiveFragment={isActiveFragment}
                      onFragmentClick={onFragmentClick}
                    />
                  </Tool>
                )}
                {type !== 'ERROR' && (
                  <AssistantMessageActions
                    content={content}
                    isStreaming={isStreaming}
                    generationTime={generationTime}
                  />
                )}
                {type === 'ERROR' && (
                  <Reasoning
                    isStreaming={false}
                    className="text-base sm:text-base"
                  >
                    Error details
                  </Reasoning>
                )}
              </MessageContent>
            </Message>
          </div>
        )}
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.role === nextProps.role &&
      prevProps.type === nextProps.type &&
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.isActiveFragment === nextProps.isActiveFragment &&
      prevProps.fragment?.id === nextProps.fragment?.id
    )
  }
)

MessageCard.displayName = 'MessageCard'
