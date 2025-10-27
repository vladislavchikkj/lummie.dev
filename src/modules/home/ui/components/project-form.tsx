'use client'

import { z } from 'zod'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosezi from 'react-textarea-autosize'
import {
  ArrowUpIcon,
  Loader2Icon,
  Sparkles,
  Plus,
  Camera,
  History,
  Upload,
  X,
} from 'lucide-react'
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
  processImages,
  validateImageFile,
  type ProcessedImage,
} from '@/lib/image-processing'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [attachedImages, setAttachedImages] = useState<File[]>([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)

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
    try {
      let processedImages: ProcessedImage[] | undefined = undefined

      if (attachedImages.length > 0) {
        setIsProcessingImages(true)
        try {
          processedImages = await processImages(attachedImages)
          console.log('Processed images:', processedImages)
        } catch (error) {
          console.error('Error processing images:', error)
          toast.error('Failed to process images')
          setIsProcessingImages(false)
          return
        } finally {
          setIsProcessingImages(false)
        }
      }

      await createProject.mutateAsync({
        value: values.value,
        images: processedImages,
      })

      // Reset form and images after successful submission
      form.reset()
      setAttachedImages([])
    } catch (error) {
      console.error('Error in onSubmit:', error)
      toast.error('Failed to create project')
    }
  }

  const onSelect = (value: string) => {
    form.setValue('value', value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const validFiles: File[] = []

      Array.from(files).forEach((file) => {
        const validation = validateImageFile(file)
        if (validation.valid) {
          validFiles.push(file)
        } else {
          toast.error(`${file.name}: ${validation.error}`)
        }
      })

      if (validFiles.length > 0) {
        setAttachedImages((prev) => [...prev, ...validFiles])
        toast.success(`${validFiles.length} image(s) added`)
      }
    }
    event.target.value = ''
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const validation = validateImageFile(files[0])
      if (validation.valid) {
        setAttachedImages((prev) => [...prev, files[0]])
        toast.success('Photo captured')
      } else {
        toast.error(validation.error || 'Invalid image file')
      }
    }
    event.target.value = ''
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadFromComputer = () => {
    fileInputRef.current?.click()
  }

  const handlePreviouslyAttached = () => {
    console.log('Show previously attached images')
  }

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const [isFocused, setIsFocused] = useState(false)
  const isPending = createProject.isPending || isProcessingImages
  const isButtonDisabled =
    isPending || (!form.formState.isValid && attachedImages.length === 0)

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'bg-sidebar dark:bg-sidebar relative rounded-xl border p-4 pt-1 transition-all',
            isFocused && 'shadow-xs'
          )}
        >
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />

          {attachedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-3">
              {attachedImages.map((file, index) => (
                <div key={index} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="border-border h-20 w-20 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                          className="h-7 rounded-full px-3"
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
                            className="cursor-pointer"
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

            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full"
                          disabled={isPending}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleTakePhoto}>
                          <Camera className="mr-2 size-4" />
                          Take photo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handlePreviouslyAttached}>
                          <History className="mr-2 size-4" />
                          Previously attached
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleUploadFromComputer}>
                          <Upload className="mr-2 size-4" />
                          Upload files
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach images to your project</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                disabled={isButtonDisabled}
                className={cn(
                  'size-8 rounded-full',
                  isButtonDisabled && 'bg-muted-foreground border'
                )}
              >
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <ArrowUpIcon />
                )}
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
      />
    </Form>
  )
}
