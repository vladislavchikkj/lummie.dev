'use client'

import { z } from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosezi from 'react-textarea-autosize'
import { ArrowUpIcon, Loader2Icon, Sparkles } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { PROJECT_TEMPLATES } from '../../constants'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RotatingText } from '@/components/ui/rotating-text'
import { A11Y_OUTLINE_CLASSES } from '@/components/constants'

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'Value is required' })
    .max(10000, { message: 'Value is too long' }),
})

export const ProjectForm = () => {
  const router = useRouter()
  const trpc = useTRPC()
  const clerk = useClerk()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions())
        queryClient.invalidateQueries(trpc.usage.status.queryOptions())
        router.push(`/projects/${data.id}`)
      },
      onError: (error) => {
        toast.error(error.message)
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn()
        }
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          router.push('/pricing')
        }
      },
    })
  )

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.value,
    })
  }

  const onSelect = (value: string) => {
    form.setValue('value', value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    })
  }

  const [isFocused, setIsFocused] = useState(false)
  const isPending = createProject.isPending
  const isButtonDisabled = isPending || !form.formState.isValid

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'bg-sidebar dark:bg-sidebar relative rounded-xl border p-4 pt-1 transition-all',
            isFocused && 'shadow-xs',
            isFocused && 'outline-style-solid outline-2 outline-offset-2 outline-blue-500 ring-blue-500! dark:outline-zinc-50 ring-0',
          )}
        >
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              // 1. Создаем относительный контейнер
              <div className="relative">
                <TextareaAutosezi
                  {...field}
                  disabled={isPending}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  minRows={2}
                  maxRows={8}
                  className="w-full resize-none border-none bg-transparent pt-4 outline-none placeholder:text-transparent"
                  placeholder=" "
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      form.handleSubmit(onSubmit)()
                    }
                  }}
                />

                {!field.value && (
                  <div className="pointer-events-none absolute top-3 left-0">
                    <RotatingText
                      className="text-muted-foreground text-base"
                      duration={3000}
                      transition={{ ease: 'easeInOut' }}
                      text={[
                        'What would you like to build?',
                        'Describe your idea...',
                        'A landing page for a new SaaS...',
                        'A blog post about AI...',
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
          />
          <div className="flex items-end justify-between gap-x-2 pt-2">
            <div className="flex items-end gap-x-4">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={cn(A11Y_OUTLINE_CLASSES, 'h-7 rounded-full px-3')}
                          disabled={isPending}
                        >
                          <Sparkles className="mr-1.5 size-3.5" />
                          Use a template
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>
                          Start with a template
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {PROJECT_TEMPLATES.map((template) => (
                          <DropdownMenuItem
                            key={template.title}
                            onSelect={() => onSelect(template.prompt)}
                            className={cn('cursor-pointer', A11Y_OUTLINE_CLASSES)}
                          >
                            {template.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start with a template</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-muted-foreground hidden font-mono text-[10px] sm:block">
                <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none">
                  <span>&#8984;</span>Enter
                </kbd>
                &nbsp;to submit
              </div>
            </div>

            <Button
              disabled={isButtonDisabled}
              className={cn(
                A11Y_OUTLINE_CLASSES,
                'size-8 rounded-full',
                isButtonDisabled && 'bg-muted-foreground border'
              )}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ArrowUpIcon/>
              )}
            </Button>
          </div>
        </form>
      </section>
    </Form>
  )
}
