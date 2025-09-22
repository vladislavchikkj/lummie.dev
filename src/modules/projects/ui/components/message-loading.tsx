import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import { useState, useEffect } from 'react'

const ShimmerMessages = () => {
  const messages = [
    'Thinking...',
    'Loading...',
    'Generating...',
    'Analyzing your request...',
    'Building your website...',
    'Crafting components...',
    'Optimizing layout...',
    'Adding final touches...',
    'Almost ready...',
  ]

  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground animate-pulse text-base">
        {messages[currentMessage]}
      </span>
    </div>
  )
}

export const MessageLoading = () => {
  return (
    <Message from="assistant">
      <MessageContent>
        <ShimmerMessages />
      </MessageContent>
    </Message>
  )
}
