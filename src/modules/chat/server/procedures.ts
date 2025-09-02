import {z} from "zod";
import OpenAI from "openai";
import {prisma} from '@/lib/db'

import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {
  createChatInputSchema,
  GetManyInput,
  getManyInputSchema, SendMessageInput,
  sendMessageInputSchema
} from "@/modules/chat/constants/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 20 * 1000, // 20 seconds timeout
  maxRetries: 1
});


  interface Message
{
  chatId: string;
  content: string;
  role: "USER" | "ASSISTANT";
  type: string;
}

export const chatRouter = createTRPCRouter({
  createChat: protectedProcedure
    .input(createChatInputSchema)
    .mutation(async ({input, ctx}) => {
      console.log("Creating chat with initial message:", input.content);
      const chat = await prisma.chat.create({
        data: {userId: ctx.auth.userId || "unknown"},
      });
      return {chatId: chat.id, initialMessage: input.content};
    }),

  getMany: protectedProcedure
    .input(getManyInputSchema)
    .query(async ({input}: { input: GetManyInput }) => {
      return prisma.chatMessage.findMany({
        where: {chatId: input.chatId},
        orderBy: {createdAt: "asc"},
      });
    }),

  sendMessage: protectedProcedure
    .input(sendMessageInputSchema)
    .mutation(async function ({input}: { input: SendMessageInput }) {
      console.log("Received message:", input.content);
      const userMessage = await prisma.chatMessage.create({
        data: {
          chatId: input.chatId,
          content: input.content,
          role: "USER",
          type: "TEXT",
        },
      });

      const response = await openai.responses.create({
        model: 'gpt-4o-mini',
        instructions: 'You are a coding assistant',
        input: input.content,
      });
      console.log('Response ', response)
      const assistantContent = "TEST";


      const assistantMessage = await prisma.chatMessage.create({
        data: {
          chatId: input.chatId,
          content: response.output_text,
          role: "ASSISTANT",
          type: 'TEXT',
        },
      });
      return {type: "complete", data: assistantMessage}; // Сигнал завершения
    }),
});

// sendMessage: protectedProcedure
//   .input(sendMessageInputSchema)
//   .mutation(async function* ({input}: { input: SendMessageInput }) {
//     console.log("Received message:", input.content);
//     const userMessage = await prisma.chatMessage.create({
//       data: {
//         chatId: input.chatId,
//         content: input.content,
//         role: "USER",
//         type: "TEXT",
//       },
//     });
//     yield {type: "user_saved", data: userMessage}; // Подтверждение сохранения
//
//     const stream = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {role: "user", content: input.content}, // Только текущее сообщение
//       ],
//       stream: true,
//     });
//
//     let assistantContent = "";
//     // TODO Double check on validity of stream and prop access
//     for await (const chunk of stream) {
//       const delta = chunk.choices[0]?.delta?.content || "";
//       if (delta) {
//         assistantContent += delta;
//         yield {type: "stream_chunk", data: delta}; // Отправляем часть клиенту
//       }
//     }
//
//     const assistantMessage = await prisma.chatMessage.create({
//       data: {
//         chatId: input.chatId,
//         content: assistantContent,
//         role: "ASSISTANT",
//         type: "TEXT",
//       },
//     });
//     yield {type: "complete", data: assistantMessage}; // Сигнал завершения
//   }),