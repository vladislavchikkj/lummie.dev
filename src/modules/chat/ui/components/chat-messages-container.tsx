'use client';
import React from "react";
import {ChatUserMessage} from "@/modules/chat/ui/components/chat-user-message";
import {ChatModelMessage} from "@/modules/chat/ui/components/chat-model-message";
import {ChatMessage} from "@/modules/chat/constants/types";


type Props = {
  messages: ChatMessage[];
}

export const ChatMessagesContainer = ({messages}: Props) => {
  return (
    <div className='p-10 flex-1 overflow-y-auto'>
      {
        messages.map((msg, index) => (
          msg.role === 'USER' ? (
            <ChatUserMessage key={index} content={msg.content}/>
          ) : (
            <ChatModelMessage key={index} content={msg.content}/>
          )
        ))
      }
    </div>
  );
}