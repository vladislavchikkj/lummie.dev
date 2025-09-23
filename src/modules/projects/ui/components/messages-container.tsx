import { useEffect, useRef } from 'react'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ReasoningLoading } from './reasoning-loading'
import { cn } from '@/lib/utils'

import { MessageCard } from './message-card'
import { MessageForm } from './message-form'
import { Fragment } from '@/generated/prisma'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation'

interface Props {
  projectId: string
  activeFragment: Fragment | null
  setActiveFragment: (fragment: Fragment | null) => void
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const trpc = useTRPC()
  const lastMessageWithFragmentIdRef = useRef<string | null>(null)

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId: projectId },
      {
        refetchInterval: 5000,
      }
    )
  )

  useEffect(() => {
    const lastMessageWithFragment = messages.findLast(
      (message) => !!message.fragment
    )

    if (
      lastMessageWithFragment?.fragment &&
      lastMessageWithFragment.id !== lastMessageWithFragmentIdRef.current
    ) {
      setActiveFragment(lastMessageWithFragment.fragment)
      lastMessageWithFragmentIdRef.current = lastMessageWithFragment.id
    }
  }, [messages, setActiveFragment])

  const lastMessage = messages[messages.length - 1]
  const isLastMessageUser = lastMessage?.role === 'USER'

  const isCenteredLayout = !activeFragment

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <Conversation>
          <ConversationContent
            className={cn(
              'flex min-h-0 flex-col pt-5',
              isCenteredLayout && 'mx-auto max-w-3xl'
            )}
          >
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                content={message.content}
                role={message.role}
                fragment={message.fragment}
                createdAt={message.createdAt}
                isActiveFragment={activeFragment?.id === message.fragment?.id}
                onFragmentClick={() => {
                  setActiveFragment(message.fragment)
                }}
                type={message.type}
              />
            ))}

            {isLastMessageUser && <ReasoningLoading />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="relative shrink-0 p-3 pt-1">
        <div className="to-background pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent" />
        <div className={cn(isCenteredLayout && 'mx-auto max-w-3xl')}>
          <MessageForm
            key={activeFragment ? 'narrow' : 'wide'}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  )
}
