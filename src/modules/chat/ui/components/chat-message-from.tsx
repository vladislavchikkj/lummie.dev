"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField} from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {ArrowUpIcon, Loader2Icon, Plus} from "lucide-react";
import {useRouter} from "next/navigation";
import {useTRPC} from "@/trpc/client";
import {useMutation} from "@tanstack/react-query";

const formSchema = z.object({
  value: z
    .string()
    .min(1, {message: 'Value is required'})
    .max(10000, {message: 'Value is too long'}),
})

type Props = {
  rootChat: boolean,
  onSubmit?: (message: string) => void,
  isStreaming?: boolean
}

export const ChatMessageFrom = ({rootChat, onSubmit, isStreaming}: Props) => {
  console.log('ChatMessageFrom rendered with rootChat:', rootChat);
  const router = useRouter();
  const trpc = useTRPC();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  })
  const isPending = false ; // TODO change to actual pending state
  const [isFocused, setIsFocused] = useState(false);

  const createChatMutation = useMutation(
    trpc.chat.createChat.mutationOptions({
      onSuccess: ({chatId}) => {
        console.log('Chat created with ID:', chatId);
        router.push(`/chat/${chatId}`);
      },
      onError: (error) => {
        console.error('Error creating chat:', error);
      }
    })
  )

  const formSubmit = (data: z.infer<typeof formSchema>) => {
    if (rootChat) {
      createChatMutation.mutate({content: data.value});
    } else {
      // Here you would handle sending a message in an existing chat
      if (onSubmit) {
        onSubmit(data.value);
      }
      console.log('Sending message in existing chat:', data.value);
    }
    form.reset();
  }

  return (
    <Form {...form}>
      <div className={'p-10 min-h-[120px] pt-0'}>

        <form
          className={
            cn(
              'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
              isFocused && 'shadow-xs')
          }
          onSubmit={form.handleSubmit(formSubmit)}>
          <FormField
            control={form.control}
            name='value'
            render={({field}) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className='pt-4 resize-none border-none w-full outline-none bg-transparent'
                placeholder='What would you like to build?'
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    form.handleSubmit(formSubmit)()
                  }
                }}
              />
            )}
          />
          <div className='flex gap-x-2 items-end justify-between pt-2'>
            <Button
              disabled={false}
              className={cn(
                'size-8 rounded-full bg-white border border-gray-300 hover:border-gray-300 hover:bg-gray-100 transition-colors group'
              )}>
              <Plus className="text-black"/>
            </Button>
            <div className='flex flex-row items-center justify-center gap-2'>
              <div className='text-[10px] text-muted-foreground font-mono'>
                <kbd
                  className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
                  <span>&#8984;</span>Enter
                </kbd>
                &nbsp;to submit
              </div>
              <Button
                disabled={false}
                className={cn(
                  'size-8 rounded-full hover:scale-105 transition-transform',
                  false && 'bg-muted-foreground border'
                )}
              >
                {isPending ? (
                  <Loader2Icon className='size-4 animate-spin'/>
                ) : (
                  <ArrowUpIcon/>
                )}
              </Button>
            </div>

          </div>
        </form>
      </div>
    </Form>
  )
}
