import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'
import type { HTMLAttributes } from 'react'

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
}

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full items-end justify-end gap-2 py-4',
      from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse',
      className
    )}
    {...props}
  />
)

export type MessageContentProps = HTMLAttributes<HTMLDivElement>

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      'text-foreground flex flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3',
      'group-[.is-user]:bg-muted group-[.is-user]:mr-4',
      'group-[.is-user]:max-w-[80%] group-[.is-user]:rounded-br-none',
      'group-[.is-assistant]:max-w-full',

      className
    )}
    {...props}
  >
    <div className="is-user:dark flex flex-col gap-4">{children}</div>
  </div>
)
