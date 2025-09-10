interface Props {
  content: string
}

export const ChatUserMessage = ({ content }: Props) => {
  return (
    <div className="flex justify-end">
      <div className="bg-accent text-accent-foreground max-w-full rounded-xl rounded-tr-none p-3 break-words md:max-w-[80%]">
        {content}
      </div>
    </div>
  )
}
