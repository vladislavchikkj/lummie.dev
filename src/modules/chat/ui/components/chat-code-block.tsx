'use client'

import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  lang: string
  code: string
}

export const ChatCodeBlock = ({ lang, code }: Props) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border bg-zinc-950 font-mono text-sm">
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-900 px-4 py-1.5 text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="size-4" />
          <span>{lang || 'code'}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          onClick={handleCopy}
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <div className="overflow-x-auto p-4 text-white">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
