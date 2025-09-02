import {ChatMessageFrom} from "@/modules/chat/ui/components/chat-message-from";
import Logo from "@/components/ui/logo";
import Link from "next/link";

type Props = { params: { id: string } };

export const ChatViewEmpty = () => {
  return (
    <section className="flex flex-col h-screen w-screen g-10 justify-center">
      <Link href='/' className='flex flex-col items-center gap-2 self-center mb-5'>
        <Logo width={75} height={75}/>
        <h2
          className='mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-6xl dark:text-neutral-100'>Lummie.ai</h2>
      </Link>
      <ChatMessageFrom rootChat={true}/>
    </section>
  )
}