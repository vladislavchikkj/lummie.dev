import { z } from 'zod'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import TextareaAutosize from 'react-textarea-autosize'
import {
  ArrowUpIcon,
  Loader2Icon,
  Plus,
  Camera,
  History,
  Upload,
  X,
  Sparkles,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Usage } from './usage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  processImages,
  validateImageFile,
  type ProcessedImage,
} from '@/lib/image-processing'
import { PROJECT_TEMPLATES } from '@/modules/home/constants'

interface Props {
  projectId: string
  onSubmit?: (
    message: string,
    images?: ProcessedImage[],
    originalFiles?: File[]
  ) => void
  isStreaming?: boolean
  onStop?: () => void
  initialValue?: string
}

const formSchema = z.object({
  value: z.string().max(10000, { message: 'Value is too long' }),
})

export const MessageForm = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  projectId: _projectId,
  onStop,
  isStreaming,
  onSubmit,
  initialValue,
}: Props) => {
  const trpc = useTRPC()
  const { userId } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [attachedImages, setAttachedImages] = useState<File[]>([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showUsagePanel, setShowUsagePanel] = useState(true)

  const { data: usage } = useQuery({
    ...trpc.usage.status.queryOptions(),
    enabled: !!userId,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: initialValue || '',
    },
  })

  useEffect(() => {
    if (initialValue !== undefined) {
      form.setValue('value', initialValue)
    }
  }, [initialValue, form])

  const formSubmit = async (data: z.infer<typeof formSchema>) => {
    if (isStreaming) return

    if (!data.value.trim() && attachedImages.length === 0) {
      toast.error('Please enter a message or attach an image')
      return
    }

    if (onSubmit) {
      try {
        let processedImages: ProcessedImage[] | undefined = undefined
        const originalFiles =
          attachedImages.length > 0 ? [...attachedImages] : []

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

        console.log('Calling onSubmit with value:', data.value)
        console.log('Processed images:', processedImages)
        const messageText = data.value.trim() || ' '
        onSubmit(
          messageText,
          processedImages,
          originalFiles.length > 0 ? originalFiles : undefined
        )
        form.reset()
        setAttachedImages([])
      } catch (error) {
        console.error('Error in formSubmit:', error)
        toast.error('Failed to send message')
      }
    }
  }

  const isButtonDisabled =
    (!form.formState.isValid && attachedImages.length === 0 && !isStreaming) ||
    isProcessingImages
  const showUsage = !!usage && showUsagePanel

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

  const onSelectTemplate = (value: string) => {
    form.setValue('value', value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    })
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isStreaming && onStop) {
      onStop()
    } else {
      form.handleSubmit(formSubmit)()
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    handleResize()

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
          onClose={() => setShowUsagePanel(false)}
        />
      )}
      <section className="space-y-6">
        <form
          onSubmit={form.handleSubmit(formSubmit)}
          className={cn(
            'bg-sidebar dark:bg-sidebar relative rounded-xl border p-3 pt-1 transition-all',
            showUsage ? 'rounded-t-none rounded-b-xl' : 'rounded-xl',
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
                <TextareaAutosize
                  {...field}
                  disabled={isProcessingImages}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  minRows={1}
                  maxRows={4}
                  className="w-full resize-none border-none bg-transparent py-2 outline-none placeholder:text-transparent"
                  placeholder=" "
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      form.handleSubmit(formSubmit)()
                    }
                  }}
                />

                {!field.value && (
                  <div className="pointer-events-none absolute top-2 left-0">
                    <div className="text-muted-foreground text-base">
                      Message Lummie...
                    </div>
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
                          disabled={isProcessingImages}
                        >
                          <Sparkles className="mr-1.5 size-3.5" />
                          Use a template
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem disabled>
                          <span className="text-muted-foreground">
                            Start with a template
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {PROJECT_TEMPLATES.map((template) => (
                          <DropdownMenuItem
                            key={template.title}
                            onSelect={() => onSelectTemplate(template.prompt)}
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
                          disabled={isProcessingImages}
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
                    <p>Attach images to your message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                disabled={isButtonDisabled}
                className={cn(
                  'size-8 rounded-full',
                  isButtonDisabled && 'bg-muted-foreground border'
                )}
                onClick={handleButtonClick}
              >
                {isStreaming ? (
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
