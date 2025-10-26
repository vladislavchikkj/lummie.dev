import { cn } from '@/lib/utils'
import type { UIMessage } from 'ai'
import type { HTMLAttributes } from 'react'

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
}

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex items-end gap-2 py-4',
      from === 'user'
        ? 'is-user justify-end'
        : 'is-assistant flex-row-reverse justify-start',
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
      'text-foreground flex flex-col gap-2 overflow-hidden rounded-2xl px-3 py-3 sm:px-4',
      'group-[.is-user]:bg-muted group-[.is-user]:mr-0 sm:group-[.is-user]:mr-4',
      'group-[.is-user]:w-fit group-[.is-user]:max-w-[95%] group-[.is-user]:self-end group-[.is-user]:rounded-br-none',
      'group-[.is-assistant]:ml-0 group-[.is-assistant]:max-w-full group-[.is-assistant]:self-start sm:group-[.is-assistant]:ml-4',

      className
    )}
    {...props}
  >
    <div className="is-user:dark flex flex-col gap-4">{children}</div>
  </div>
)
