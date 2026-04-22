import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";

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
            symbol: SymbolSchema.optional(),
            comparisonSymbols: z.array(SymbolSchema).max(5).optional(),
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

  getConfidence: protectedProcedure
    .input(
      z.object({
        symbol: SymbolSchema,
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
      const result = await fn({
        messages: [
          {
            role: "user",
            content: `Give a brief overall investment confidence assessment for ${input.symbol}. Consider recent SEC filings, financial health, and market position. Keep your answer to 2-3 sentences.`,
          },
        ],
        context: { symbol: input.symbol },
        ...(input.language ? { language: input.language } : {}),
      });
      return { symbol: input.symbol, confidence: result.confidence };
    }),
});
