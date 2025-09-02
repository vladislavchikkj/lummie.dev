import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  createChatInputSchema,
  GetManyInput,
  getManyInputSchema,
  sendMessageInputSchema,
} from "@/modules/chat/constants/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatRouter = createTRPCRouter({
  createChat: protectedProcedure
    .input(createChatInputSchema)
    .mutation(async ({input, ctx}) => {
      const chat = await prisma.chat.create({
        data: {userId: ctx.auth.userId || "unknown"},
      });
      await prisma.chatMessage.create({
        data: {
          chatId: chat.id,
          content: input.content,
          role: "USER",
          type: "TEXT",
        },
      });
      return {chatId: chat.id};
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
    .mutation(async function* ({input}) {
      try {
        await prisma.chatMessage.create({
          data: {
            chatId: input.chatId,
            content: input.content,
            role: "USER",
            type: "TEXT",
          },
        });

        const history = await prisma.chatMessage.findMany({
          where: {chatId: input.chatId},
          orderBy: {createdAt: "desc"},
          take: 1,
        });

        const messagesForApi = history.map((msg) => {
            console.log("PREF Mapping message for API:", msg);
            return {
              role: msg.role.toLowerCase() as "user" | "assistant",
              content: msg.content,
            }
          }
        );

        const stream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messagesForApi,
          stream: true,
        });

        let assistantContent = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          console.log("Received chunk:", delta);
          if (delta) {
            assistantContent += delta;
            yield delta;
          }
        }
        console.log("Full assistant content:", assistantContent);
        if (assistantContent) {
          await prisma.chatMessage.create({
            data: {
              chatId: input.chatId,
              content: assistantContent,
              role: "ASSISTANT",
              type: "TEXT",
            },
          });
        }
      } catch (error) {
        console.error("Streaming mutation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while processing your message.",
        });
      }
    }),
});