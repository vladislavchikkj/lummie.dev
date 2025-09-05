import { Card } from '@/components/ui/card'

interface Props {
  content: string
}

export const ChatUserMessage = ({ content }: Props) => {
  return (
    <div className="w-full">
      <div className="pt-2 pr-1">
        <div className="flex justify-end pr-2 pb-4 pl-10">
          <Card className="bg-muted max-w-[80%] rounded-lg border-none p-3 break-words shadow-none">
            {content}
          </Card>
        </div>
      </div>
    </div>
  )
}
