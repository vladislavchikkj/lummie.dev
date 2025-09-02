'use client';

import {ChatMessagesContainer} from "@/modules/chat/ui/components/chat-messages-container";
import {ChatMessageFrom} from "@/modules/chat/ui/components/chat-message-from";
import {useTRPC} from "@/trpc/client";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useMutation, useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {useEffect, useRef, useState} from "react";
import {ChatMessage} from "@/modules/chat/constants/types";

type Props = { chatId: string }


const INITIAL_MSG_KEY = "initialMessage";

export const ChatView = ({chatId}: Props) => {
  console.log('ChatView rendered with chatId:', chatId);
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get(INITIAL_MSG_KEY);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const trpc = useTRPC();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      const removeQueryParams = () => {
        router.replace(pathname, {scroll: true});
      };
      removeQueryParams();

      const updatedInitialMessage: ChatMessage = {role: 'USER', content: initialMessage, chatId, type: 'TEXT'};
      setMessages((prevMessages) => [...prevMessages, updatedInitialMessage]);
    }

    console.log("Initial message from URL:", initialMessage);

  }, []);

  const handleNewMessage = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      // onMutate: () => {
      //   setIsStreaming(true);
      //   setStreamingContent("");
      // },
      onSuccess: (newMessage) => {
        // queryClient.invalidateQueries(trpc.chat.getMany.queryOptions({chatId}));
        console.log("New message received:", newMessage);
        const modelMessage: ChatMessage = {
          role: "ASSISTANT",
          content: newMessage.data.content,
          chatId,
          type: "TEXT",
        };
        setMessages((prevMessages) => [...prevMessages, modelMessage]);
      },
      onError: (error) => {
        console.error("Error sending message:", error);
        setIsStreaming(false);
        setStreamingContent("");
      },
      // onSettled: () => {
      //   setIsStreaming(false);
      //   setStreamingContent("");
      // }
    })
  )

  const onSubmit = async (message: string) => {
    console.log("Submitting message:", message);
    const userMsg: ChatMessage = {role: "USER", content: message, chatId, type: "TEXT"}
    setMessages((prevMessages) => [...prevMessages, userMsg]);
    await handleNewMessage.mutateAsync({chatId, content: message})
  }


  return (
    <section className="flex flex-col flex-1 min-h-0 h-screen">
      <ChatMessagesContainer messages={messages}/>
      <ChatMessageFrom rootChat={false} onSubmit={onSubmit}/>
    </section>
  )
}