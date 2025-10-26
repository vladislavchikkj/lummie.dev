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
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
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
  DropdownMenuSeparator,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [attachedImages, setAttachedImages] = useState<File[]>([])

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
      console.log('Attached images:', attachedImages)
      onSubmit(data.value)
    }
    form.reset()
    setAttachedImages([])
  }

  const isButtonDisabled = !form.formState.isValid && !isStreaming
  const showUsage = !!usage

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )
      setAttachedImages((prev) => [...prev, ...imageFiles])
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setAttachedImages((prev) => [...prev, files[0]])
    }
  }

  const handleTakePhoto = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadFromComputer = () => {
    fileInputRef.current?.click()
  }

  const handlePreviouslyAttached = () => {
    // TODO: Implement previously attached images functionality
    console.log('Show previously attached images')
  }

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

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
          'bg-muted border-border relative flex flex-col border',
          showUsage ? 'rounded-t-none rounded-b-xl' : 'rounded-xl'
        )}
      >
        {/* Attached Images Preview */}
        {attachedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
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

        <div className="relative flex flex-1 items-center">
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
              <DropdownMenuContent align="end" className="w-56">
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
        </div>
      </form>
    </Form>
  )
}
