import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";
import { runLlm } from "../lib/llm-errors";

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
      // Cast through Parameters<typeof fn>[0] sidesteps Vercel's all-optional
      // zod inference for messages and context types.
      return runLlm(() =>
        fn({
          messages: input.messages,
          context: {
            symbol: input.context.symbol,
            comparisonSymbols: input.context.comparisonSymbols,
          },
          ...(input.language ? { language: input.language } : {}),
        } as Parameters<typeof fn>[0]),
      );
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
      const result = await runLlm(() =>
        fn({
          messages: [
            {
              role: "user",
              content: `Give a brief overall investment confidence assessment for ${input.symbol}. Consider recent SEC filings, financial health, and market position. Keep your answer to 2-3 sentences.`,
            },
          ],
          context: { symbol: input.symbol },
          ...(input.language ? { language: input.language } : {}),
        }),
      );
      return { symbol: input.symbol, confidence: result.confidence };
    }),
});
