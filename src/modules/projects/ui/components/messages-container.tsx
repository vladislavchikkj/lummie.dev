import { ReactNode } from 'react'
import { ReasoningLoading } from './reasoning-loading'
import { cn } from '@/lib/utils'

import { MessageCard } from './message-card'
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
  messages: {
    id: string
    content: string
    role: 'USER' | 'ASSISTANT'
    type: 'RESULT' | 'ERROR'
    createdAt: Date
    fragment: Fragment | null
  }[]
  children: ReactNode
  projectCreating: boolean
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
  children,
  projectCreating,
  messages,
}: Props) => {
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
            {isLastMessageUser && projectCreating && <ReasoningLoading />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="relative shrink-0 p-3 pt-1">
        <div className="to-background pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent" />
        <div className={cn(isCenteredLayout && 'mx-auto max-w-3xl')}>
          {children}
        </div>
      </div>
    </div>
  )
}
