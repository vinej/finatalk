import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const researchRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(ChatMessageSchema).min(1).max(40),
        context: z
          .object({
            symbol: z.string().trim().min(1).max(20).optional(),
            comparisonSymbols: z.array(z.string().trim().min(1).max(20)).max(5).optional(),
          })
          .default({}),
        language: z.string().min(2).max(10).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithResearch;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI research is not configured on this server.",
        });
      }
      return fn({
        messages: input.messages,
        context: {
          symbol: input.context.symbol,
          comparisonSymbols: input.context.comparisonSymbols,
        },
        ...(input.language ? { language: input.language } : {}),
      });
    }),
});
