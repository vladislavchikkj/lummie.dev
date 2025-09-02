import {ChatMessageFrom} from "@/modules/chat/ui/components/chat-message-from";
import Logo from "@/components/ui/logo";
import Link from "next/link";
import {ChatViewEmpty} from "@/modules/chat/ui/components/chat-view-empty";

const Page = () => {
  return (
    // Todo add ErrorBoundary and Suspense
    <ChatViewEmpty/>
  )
}

export default Page