import { ChatMessageFrom } from '@/modules/chat/ui/components/chat-message-from'
import Logo from '@/components/ui/logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Code, BookOpen } from 'lucide-react'

const examplePrompts = [
  {
    icon: <Lightbulb className="size-5" />,
    title: 'Explain a concept',
    prompt: 'Explain quantum computing in simple terms',
  },
  {
    icon: <Code className="size-5" />,
    title: 'Write some code',
    prompt: 'Write a python script to sort a list of numbers',
  },
  {
    icon: <BookOpen className="size-5" />,
    title: 'Summarize text',
    prompt: 'Summarize the main points of the book "Sapiens"',
  },
]

export const ChatViewEmpty = () => {
  return (
    <div className="bg-background relative flex h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mb-12 flex flex-col items-center gap-4">
          <Logo width={75} height={75} />
          <h1 className="from-foreground to-foreground/60 bg-gradient-to-br bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent">
            How can I help you today?
          </h1>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {examplePrompts.map((item, index) => (
            <Card
              key={index}
              className="border-border/50 bg-background/50 hover:bg-muted/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ChatMessageFrom rootChat={true} />
    </div>
  )
}
