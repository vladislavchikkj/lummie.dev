'use client'

import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ui/shadcn-io/ai/reasoning'
import { useCallback, useEffect, useState } from 'react'

const reasoningSteps = [
  'Let me think about this step by step.',
  '\n\nFirst, I need to understand the request.',
  '\n\nThe user wants to see the generation process for their website.',
  '\n\nI will break this down into several tasks: planning the structure, generating components, styling, and assembling the final page.',
  '\n\nThis seems like a solid plan. I will now begin the generation process.',
].join('')

export const ReasoningLoading = () => {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0)
  const [tokens, setTokens] = useState<string[]>([])

  const chunkIntoTokens = useCallback((text: string): string[] => {
    const tokens: string[] = []
    let i = 0
    while (i < text.length) {
      const chunkSize = Math.floor(Math.random() * 3) + 4
      tokens.push(text.slice(i, i + chunkSize))
      i += chunkSize
    }
    return tokens
  }, [])

  useEffect(() => {
    const tokenizedSteps = chunkIntoTokens(reasoningSteps)
    setTokens(tokenizedSteps)
    setContent('')
    setCurrentTokenIndex(0)
    setIsStreaming(true)
  }, [chunkIntoTokens])

  useEffect(() => {
    if (!isStreaming || currentTokenIndex >= tokens.length) {
      if (isStreaming) {
        setIsStreaming(false)
      }
      return
    }
    const timer = setTimeout(() => {
      setContent((prev) => prev + tokens[currentTokenIndex])
      setCurrentTokenIndex((prev) => prev + 1)
    }, 25)

    return () => clearTimeout(timer)
  }, [isStreaming, currentTokenIndex, tokens])

  return (
    <Message from="assistant">
      <MessageContent>
        <Reasoning
          className="w-full"
          isStreaming={isStreaming}
          defaultOpen={true}
        >
          <ReasoningTrigger>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground animate-pulse">Thinking...</p>
            </div>
          </ReasoningTrigger>
          <ReasoningContent>{content}</ReasoningContent>
        </Reasoning>
      </MessageContent>
    </Message>
  )
}
