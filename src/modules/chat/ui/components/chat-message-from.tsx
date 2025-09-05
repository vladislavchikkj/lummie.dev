'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField } from '@/components/ui/form'
import TextareaAutosize from 'react-textarea-autosize'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowUpIcon, Plus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'Value is required' })
    .max(10000, { message: 'Value is too long' }),
})

type Props = {
  rootChat: boolean
  onSubmit?: (message: string) => void
  isStreaming?: boolean
}

export const ChatMessageFrom = ({ rootChat, onSubmit, isStreaming }: Props) => {
  const router = useRouter()
  const trpc = useTRPC()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })
  const isPending = false // TODO change to actual pending state
  const [isFocused, setIsFocused] = useState(false)

  const createChatMutation = useMutation(
    trpc.chat.createChat.mutationOptions({
      onSuccess: ({ chatId }) => {
        router.push(`/chat/${chatId}`)
      },
      onError: (error) => {
        console.error('Error creating chat:', error)
      },
    })
  )

  const formSubmit = (data: z.infer<typeof formSchema>) => {
    if (rootChat) {
      createChatMutation.mutate({ content: data.value })
    } else {
      if (onSubmit) {
        onSubmit(data.value)
      }
    }
    form.reset()
  }

  return (
    <Form {...form}>
      <div className={'min-h-[120px] p-10 pt-0'}>
        <form
          className={cn(
            'bg-sidebar dark:bg-sidebar relative rounded-xl border p-4 pt-1 transition-all',
            isFocused && 'shadow-xs'
          )}
          onSubmit={form.handleSubmit(formSubmit)}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className="w-full resize-none border-none bg-transparent pt-4 outline-none"
                placeholder="What would you like to build?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' /*&& (e.ctrlKey || e.metaKey)*/) {
                    // TODO Uncomment to enable Ctrl+Enter submission
                    e.preventDefault()
                    form.handleSubmit(formSubmit)()
                  }
                }}
              />
            )}
          />
          <div className="flex items-end justify-between gap-x-2 pt-2">
            <Button
              className={cn(
                'group size-8 rounded-full border border-gray-300 bg-white transition-colors hover:border-gray-300 hover:bg-gray-100'
              )}
            >
              <Plus className="text-black" />
            </Button>
            <div className="flex flex-row items-center justify-center gap-2">
              <div className="text-muted-foreground font-mono text-[10px]">
                <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
                  <span>&#8984;</span>Enter
                </kbd>
                &nbsp;to submit
              </div>
              <Button
                disabled={isPending || isStreaming}
                className={cn(
                  'size-8 rounded-full transition-transform hover:scale-105',
                  false && 'bg-muted-foreground border'
                )}
              >
                {isStreaming ? <Square className="size-4" /> : <ArrowUpIcon />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Form>
  )
}
