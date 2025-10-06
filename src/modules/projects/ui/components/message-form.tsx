import { z } from 'zod'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowUpIcon, Loader2Icon, Paperclip } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Usage } from './usage'

interface Props {
  projectId: string
  onSubmit?: (message: string) => void
  isStreaming?: boolean
  onStop?: () => void
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'Value is required' })
    .max(10000, { message: 'Value is too long' }),
})

export const MessageForm = ({
  projectId,
  onStop,
  isStreaming,
  onSubmit,
}: Props) => {
  const trpc = useTRPC()

  const { data: usage } = useQuery(trpc.usage.status.queryOptions())
  const [isUsageVisible, setIsUsageVisible] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

  const formSubmit = (data: z.infer<typeof formSchema>) => {
    if (isStreaming) return
    if (onSubmit) {
      console.log('Calling onSubmit with value:', data.value)
      onSubmit(data.value)
    }
    form.reset()
  }

  const [isFocused, setIsFocused] = useState(false)
  const isButtonDisabled = !form.formState.isValid && !isStreaming
  const showUsage = !!usage

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isStreaming && onStop) {
      onStop()
    } else {
      form.handleSubmit(formSubmit)()
    }
  }

  return (
    <Form {...form}>
      {showUsage && (
        <Usage
          points={usage.remainingPoints}
          msBeforeNext={usage.msBeforeNext}
          onClose={() => setIsUsageVisible(false)}
        />
      )}
      <form
        onSubmit={form.handleSubmit(formSubmit)}
        className={cn(
          'border-input bg-muted focus-within:ring-ring focus-within:ring-offset-background dark:focus-within:ring-offset-background relative border p-4 shadow-sm transition-all focus-within:ring-2 focus-within:ring-offset-2',
          showUsage ? 'rounded-t-none rounded-b-lg' : 'rounded-lg'
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="placeholder:text-muted-foreground w-full resize-none border-none bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="How can Lummie help?"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  form.handleSubmit(formSubmit)()
                }
              }}
            />
          )}
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground rounded-full"
            disabled={isStreaming}
          >
            <Paperclip className="size-5" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Button
            type="submit"
            disabled={isButtonDisabled}
            size="icon"
            onClick={handleButtonClick}
            className="size-8 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </Form>
  )
}
