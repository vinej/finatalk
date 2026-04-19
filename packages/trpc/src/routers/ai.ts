import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  IndicatorSpec,
  IntervalSchema,
  RangeSchema,
  SymbolSchema,
} from "../schemas/indicator";
import { AccountTypeSchema, CurrencySchema, HoldingInputSchema } from "../schemas/portfolio";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const aiRouter = createTRPCRouter({
  summarizeChart: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      range: RangeSchema,
      interval: IntervalSchema,
      indicators: z.array(IndicatorSpec).max(10),
      convertTo: z.enum(["CAD"]).nullable().optional(),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.summarizeChart;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI summary is not configured on this server.",
        });
      }
      return fn({
        symbol: input.symbol,
        range: input.range,
        interval: input.interval,
        indicators: input.indicators,
        convertTo: input.convertTo ?? null,
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  chat: protectedProcedure
    .input(z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
      context: z.object({
        symbol: SymbolSchema,
        range: RangeSchema,
        interval: IntervalSchema,
        convertTo: z.enum(["CAD"]).nullable().optional(),
        activeIndicators: z.array(z.object({
          spec: IndicatorSpec,
          hidden: z.boolean(),
        })).max(20),
      }),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithAdvisor;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI chat is not configured on this server.",
        });
      }
      return fn({
        messages: input.messages,
        context: {
          symbol: input.context.symbol,
          range: input.context.range,
          interval: input.context.interval,
          convertTo: input.context.convertTo ?? null,
          activeIndicators: input.context.activeIndicators,
        },
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  chatPortfolio: protectedProcedure
    .input(z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
      context: z.object({
        portfolioTitle: z.string().min(1).max(120),
        currency: CurrencySchema,
        holdings: z.array(HoldingInputSchema).max(200),
      }),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithPortfolioAdvisor;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI portfolio chat is not configured on this server.",
        });
      }
      return fn({
        messages: input.messages,
        context: {
          portfolioTitle: input.context.portfolioTitle,
          currency: input.context.currency,
          holdings: input.context.holdings,
        },
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  chatScenario: protectedProcedure
    .input(z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
      context: z.object({
        portfolioTitle: z.string().min(1).max(120),
        currency: CurrencySchema,
        holdings: z.array(HoldingInputSchema).max(200),
      }),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithScenarioPlanner;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI scenario planner is not configured on this server.",
        });
      }
      return fn({
        messages: input.messages,
        context: {
          portfolioTitle: input.context.portfolioTitle,
          currency: input.context.currency,
          holdings: input.context.holdings,
        },
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  chatTax: protectedProcedure
    .input(z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
      context: z.object({
        portfolios: z.array(z.object({
          title: z.string().min(1).max(120),
          currency: CurrencySchema,
          accountType: z.string().nullable(),
          holdings: z.array(HoldingInputSchema).max(200),
        })).max(20),
      }),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithTaxAdvisor;
      if (!fn) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "AI tax advisor is not configured on this server." });
      return fn({
        messages: input.messages,
        context: { portfolios: input.context.portfolios },
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  chatMarket: protectedProcedure
    .input(z.object({
      messages: z.array(ChatMessageSchema).min(1).max(40),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.chatWithMarketAdvisor;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI market advisor is not configured on this server.",
        });
      }
      return fn({
        messages: input.messages,
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  generateBriefing: protectedProcedure
    .input(z.object({
      portfolios: z.array(z.object({
        title: z.string().min(1).max(120),
        currency: CurrencySchema,
        holdings: z.array(z.object({
          symbol: SymbolSchema,
          quantity: z.number().positive(),
        })).max(200),
      })).max(20),
      watchlistSymbols: z.array(SymbolSchema).max(100),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.generateBriefing;
      if (!fn) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "AI briefing is not configured on this server." });
      return fn({
        portfolios: input.portfolios,
        watchlistSymbols: input.watchlistSymbols,
        ...(input.language ? { language: input.language } : {}),
      });
    }),
});
