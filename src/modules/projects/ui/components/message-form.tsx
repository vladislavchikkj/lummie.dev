import { z } from 'zod'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowUpIcon, Loader2Icon, Plus, Paperclip } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Usage } from './usage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId: _projectId,
  onStop,
  isStreaming,
  onSubmit,
}: Props) => {
  const trpc = useTRPC()
  const { userId } = useAuth()

  const { data: usage } = useQuery({
    ...trpc.usage.status.queryOptions(),
    enabled: !!userId, // Выполнять запрос только если пользователь авторизован
  })

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

  // Handle mobile keyboard viewport adjustment
  useEffect(() => {
    const handleResize = () => {
      // Update CSS custom property for mobile viewport height
      const vh = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // Initial setup
    handleResize()

    // Listen for visual viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return (
    <Form {...form}>
      {showUsage && (
        <Usage
          points={usage.remainingPoints}
          msBeforeNext={usage.msBeforeNext}
          onClose={() => {}}
        />
      )}
      <form
        onSubmit={form.handleSubmit(formSubmit)}
        className={cn(
          'bg-muted border-border relative flex items-center border',
          showUsage ? 'rounded-t-none rounded-b-xl' : 'rounded-xl'
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              minRows={1}
              maxRows={8}
              className="placeholder:text-muted-foreground/70 w-full resize-none border-none bg-transparent px-4 py-3 pr-24 text-base leading-relaxed outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Message Lummie..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  form.handleSubmit(formSubmit)()
                }
              }}
            />
          )}
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg"
              >
                <Plus className="size-5 opacity-50" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                disabled
                className="cursor-not-allowed opacity-50"
              >
                <Paperclip className="mr-2 size-4" />
                Attach file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="submit"
            disabled={isButtonDisabled}
            size="icon"
            onClick={handleButtonClick}
            className="size-9 rounded-lg"
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
