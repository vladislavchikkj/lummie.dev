"use client";

import { ChatMessagesContainer } from "@/modules/chat/ui/components/chat-messages-container";
import { ChatMessageFrom } from "@/modules/chat/ui/components/chat-message-from";
import { useTRPC } from "@/trpc/client";
import { useState, useEffect, useMemo } from "react";
import { ChatMessage } from "@/modules/chat/constants/types";
import { useQuery, useMutation } from "@tanstack/react-query";

type Props = { chatId: string };

export const ChatView = ({ chatId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const trpc = useTRPC();

  const { data: initialMessages, refetch } = useQuery(
    trpc.chat.getMany.queryOptions(
      { chatId },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      }
    )
  );

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessageMutation = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      onError: (error) => {
        console.error("Error sending message:", error);
        setIsStreaming(false);
        setStreamingContent(
          (prev) => prev + "\n\n**Произошла ошибка при получении ответа.**"
        );
      },
      onSettled: () => {
        setIsStreaming(false);
        refetch();
      },
    })
  );

  const onSubmit = async (message: string) => {
    if (isStreaming || !message.trim()) return;

    const userMsg: ChatMessage = {
      role: "USER",
      content: message,
      chatId,
      type: "TEXT",
    };
    setMessages((prevMessages) => [...prevMessages, userMsg]);

    setIsStreaming(true);
    setStreamingContent("");

    try {
      const stream = await sendMessageMutation.mutateAsync({
        chatId,
        content: message,
      });

      for await (const chunk of stream) {
        setStreamingContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Stream processing failed:", error);
    }
  };

  const displayedMessages = useMemo(() => {
    const allMessages = [...messages];
    if (streamingContent) {
      allMessages.push({
        role: "ASSISTANT",
        content: streamingContent,
        chatId,
        type: "TEXT",
      });
    }
    return allMessages;
  }, [messages, streamingContent, chatId]);

  return (
    <section className="flex flex-col flex-1 min-h-0 h-screen">
      <ChatMessagesContainer messages={displayedMessages} />
      <ChatMessageFrom
        rootChat={false}
        onSubmit={onSubmit}
        isStreaming={isStreaming}
      />
    </section>
  );
};