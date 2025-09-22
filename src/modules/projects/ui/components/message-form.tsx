import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowUpIcon, Loader2Icon, Paperclip } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Usage } from './usage'

interface Props {
  projectId: string
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'Value is required' })
    .max(10000, { message: 'Value is too long' }),
})

export const MessageForm = ({ projectId }: Props) => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: usage } = useQuery(trpc.usage.status.queryOptions())
  const [isUsageVisible, setIsUsageVisible] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset()
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        )
        queryClient.invalidateQueries(trpc.usage.status.queryOptions())
      },
      onError: (error) => {
        toast.error(error.message)
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          router.push('/pricing')
        }
      },
    })
  )

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: values.value,
      projectId,
    })
  }

  const isPending = createMessage.isPending
  const isButtonDisabled = isPending || !form.formState.isValid
  const showUsage = !!usage && isUsageVisible

  return (
    <Form {...form}>
      {showUsage && (
        <Usage
          points={usage.remainingPoints}
          msBeforeNext={usage.msBeforeNext}
          onClose={() => setIsUsageVisible(false)}
        />
      )}
      {/* - Использован 'focus-within' для подсветки рамки при фокусе на любом дочернем элементе. Это современнее, чем state.
        - Увеличены отступы (p-4) для более "воздушного" вида.
        - Использованы стандартные цвета 'bg-background' и 'border-input' для лучшей интеграции с темой.
        - Добавлен 'transition-all' для плавных анимаций.
      */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
              disabled={isPending}
              minRows={1}
              maxRows={8}
              // - Убран 'pr-12', так как кнопки теперь позиционированы абсолютно.
              // - Добавлен 'pb-14', чтобы текст не залезал под кнопки.
              // - 'focus-visible:ring-0' убирает стандартное кольцо фокуса на самом textarea, так как оно теперь на всей форме.
              className="placeholder:text-muted-foreground w-full resize-none border-none bg-transparent text-base outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="How can Lummie help?"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  form.handleSubmit(onSubmit)()
                }
              }}
            />
          )}
        />
        {/*
          - Этот блок абсолютно позиционирован в правом нижнем углу.
          - Это делает верстку более надежной и независимой от контента.
        */}
        <div className="absolute right-3 bottom-3 flex items-center gap-x-2">
          {/* Иконка-кнопка для добавления файлов. Более интерактивна. */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground rounded-full"
            disabled={isPending}
          >
            <Paperclip className="size-5" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Button
            type="submit"
            disabled={isButtonDisabled}
            size="icon"
            className="size-8 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
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
