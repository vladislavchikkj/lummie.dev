'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField } from '@/components/ui/form'
import TextareaAutosize from 'react-textarea-autosize'
import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowUp, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: ' ' })
    .max(10000, { message: 'Value is too long' }),
})

type Props = {
  rootChat: boolean
  onSubmit?: (message: string) => void
  isStreaming?: boolean
  onStop?: () => void
}

export const ChatMessageFrom = ({
  rootChat,
  onSubmit,
  isStreaming,
  onStop,
}: Props) => {
  const router = useRouter()
  const trpc = useTRPC()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

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

  const isPending = createChatMutation.isPending

  const formSubmit = (data: z.infer<typeof formSchema>) => {
    if (isStreaming) return
    if (rootChat) {
      createChatMutation.mutate({ content: data.value })
    } else if (onSubmit) {
      onSubmit(data.value)
    }
    form.reset()
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isStreaming && onStop) {
      onStop()
    } else {
      form.handleSubmit(formSubmit)()
    }
  }

  return (
    <div className="bg-background/80 w-full pt-2 pb-4 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(formSubmit)} className="w-full">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <div className="relative flex w-full items-center overflow-hidden rounded-full border bg-zinc-100/80 dark:bg-zinc-900/80">
                  <TextareaAutosize
                    {...field}
                    disabled={isPending || isStreaming}
                    rows={1}
                    maxRows={8}
                    className="min-h-[52px] w-full flex-1 resize-none bg-transparent py-3.5 pr-16 pl-6 text-base outline-none"
                    placeholder="How can Lummie help?"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (!isStreaming && form.formState.isValid) {
                          form.handleSubmit(formSubmit)()
                        }
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={
                      isPending || (!form.formState.isValid && !isStreaming)
                    }
                    onClick={handleButtonClick}
                    className={cn(
                      'absolute top-1/2 right-2.5 size-9 -translate-y-1/2 rounded-full'
                    )}
                  >
                    {isStreaming ? (
                      <Square className="size-4" />
                    ) : (
                      <ArrowUp className="size-4" />
                    )}
                    <span className="sr-only">
                      {isStreaming ? 'Stop generating' : 'Send message'}
                    </span>
                  </Button>
                </div>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}
