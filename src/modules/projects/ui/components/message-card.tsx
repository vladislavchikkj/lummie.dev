import { Fragment, MessageRole, MessageType } from '@/generated/prisma'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import {
  ChevronRightIcon,
  Code2Icon,
  Copy,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { Response } from '@/components/ui/shadcn-io/ai/response'
import { Tool } from '@/components/ui/shadcn-io/ai/tool'
import { Reasoning } from '@/components/ui/shadcn-io/ai/reasoning'

interface FragmentCardProps {
  fragment: Fragment
  isActiveFragment: boolean
  onFragmentClick: (fragment: Fragment) => void
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        'bg-muted hover:bg-secondary flex w-fit items-start gap-2 rounded-lg border p-3 py-2 text-start transition-colors',
        isActiveFragment &&
          'bg-primary text-primary-foreground border-primary hover:bg-primary'
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon />
      <div className="flex flex-1 flex-col">
        <span className="line-clamp-1 text-sm font-medium">
          {fragment.title}
        </span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="mt-0.5 flex items-center justify-center">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  )
}

interface AssistantMessageActionsProps {
  content: string
  isStreaming?: boolean
}

const AssistantMessageActions = ({
  content,
  isStreaming = false,
}: AssistantMessageActionsProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }

  return (
    <div
      className={cn(
        'text-muted-foreground flex items-center gap-1 transition-opacity',
        isStreaming ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
      )}
    >
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <RefreshCw className="h-4 w-4" />
        <span className="sr-only">Regenerate response</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">Good response</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ThumbsDown className="h-4 w-4" />
        <span className="sr-only">Bad response</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy</span>
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Upload className="h-4 w-4" />
        <span className="sr-only">Share</span>
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
  onFragmentClick: (fragment: Fragment) => void
  type: MessageType
  isStreaming?: boolean
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
  }: MessageCardProps) => {
    const messageRole = role.toLowerCase() as 'user' | 'assistant'

    return (
      <Message from={messageRole} key={Math.random().toString()}>
        {' '}
        <MessageContent>
          {role === 'ASSISTANT' ? (
            <>
              <Response>{content}</Response>{' '}
              {/* Для assistant используем Response */}
              {fragment && type === 'RESULT' && (
                <Tool>
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
                />
              )}
              {type === 'ERROR' && (
                <Reasoning isStreaming={false}> Error details</Reasoning>
              )}
            </>
          ) : (
            content
          )}
        </MessageContent>
      </Message>
    )
  }
)

MessageCard.displayName = 'MessageCard'
