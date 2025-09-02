import {ChatView} from "@/modules/chat/ui/components/chat-view";

interface Props {
  params: Promise<{
    id: string
  }>
}
const Page = async ({params}: Props) => {
  const { id } = await params
  console.log('Chat Page rendered with id:', id);
  return (
    <ChatView chatId={id}/>
  )
}

export default Page