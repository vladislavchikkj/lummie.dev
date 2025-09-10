import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ChatCodeBlock } from './chat-code-block'

type Props = {
  content: string
}

export const ChatModelMessage = ({ content }: Props) => {
  return (
    <div className="prose prose-neutral prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeText = String(children).replace(/\n$/, '')
            return match ? (
              <ChatCodeBlock lang={match[1]} code={codeText} />
            ) : (
              <code className="not-prose rounded bg-gray-200 px-1.5 py-1 font-mono text-sm dark:bg-zinc-700">
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
