import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { alert } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";
import { ALERT_CONDITIONS, type AlertIndicatorParams } from "../constants/alerts";

export { ALERT_CONDITIONS } from "../constants/alerts";

const ConditionSchema = z.enum(ALERT_CONDITIONS);
const SourceSchema = z.enum(["manual", "strategy_symbol", "strategy_portfolio"]);

const IndicatorParamsSchema = z
  .object({
    fast: z.number().int().min(2).max(500).optional(),
    slow: z.number().int().min(2).max(500).optional(),
    signal: z.number().int().min(2).max(500).optional(),
    period: z.number().int().min(2).max(500).optional(),
    stdDev: z.number().min(0.1).max(10).optional(),
    lookback: z.number().int().min(2).max(1000).optional(),
  })
  .nullable()
  .optional();

function normalizeParams(
  conditionType: z.infer<typeof ConditionSchema>,
  params: z.infer<typeof IndicatorParamsSchema>,
): AlertIndicatorParams | null {
  switch (conditionType) {
    case "ma_cross_up":
    case "ma_cross_down": {
      const fast = params?.fast ?? 50;
      const slow = params?.slow ?? 200;
      if (fast >= slow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "fast period must be less than slow period" });
      }
      return { fast, slow };
    }
    case "rsi_above":
    case "rsi_below":
      return { period: params?.period ?? 14 };
    case "adx_above":
      return { period: params?.period ?? 14 };
    case "bb_upper_break":
    case "bb_lower_break":
      return { period: params?.period ?? 20, stdDev: params?.stdDev ?? 2 };
    case "macd_cross_up":
    case "macd_cross_down": {
      const fast = params?.fast ?? 12;
      const slow = params?.slow ?? 26;
      const signal = params?.signal ?? 9;
      if (fast >= slow) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "fast period must be less than slow period" });
      }
      return { fast, slow, signal };
    }
    case "breakout_high":
    case "breakout_low":
      return { lookback: params?.lookback ?? 20 };
    case "drawdown_from_high":
      return { lookback: params?.lookback ?? 252 };
    case "volume_spike":
      return { period: params?.period ?? 20 };
    default:
      return null;
  }
}

const GroupingSchema = z.object({
  source: SourceSchema.default("manual"),
  assetType: z.string().max(32).nullable().optional(),
  strategyKind: z.string().max(64).nullable().optional(),
  portfolioId: z.string().nullable().optional(),
});

const CreateInputSchema = z.object({
  symbol: SymbolSchema,
  conditionType: ConditionSchema,
  threshold: z.number().min(0),
  indicatorParams: IndicatorParamsSchema,
}).merge(GroupingSchema);

export const alertRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(alert)
      .where(eq(alert.userId, ctx.user.id))
      .orderBy(desc(alert.createdAt));
    return rows.map((r) => ({
      id: r.id,
      symbol: r.symbol,
      conditionType: r.conditionType,
      threshold: Number(r.threshold),
      indicatorParams: r.indicatorParams as AlertIndicatorParams | null,
      source: r.source as "manual" | "strategy_symbol" | "strategy_portfolio",
      assetType: r.assetType,
      strategyKind: r.strategyKind,
      portfolioId: r.portfolioId,
      enabled: r.enabled,
      triggeredAt: r.triggeredAt,
      createdAt: r.createdAt,
    }));
  }),

  create: protectedProcedure
    .input(CreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      const params = normalizeParams(input.conditionType, input.indicatorParams);
      await ctx.db.insert(alert).values({
        id,
        userId: ctx.user.id,
        symbol: input.symbol.toUpperCase(),
        conditionType: input.conditionType,
        threshold: String(input.threshold),
        indicatorParams: params,
        source: input.source,
        assetType: input.assetType ?? null,
        strategyKind: input.strategyKind ?? null,
        portfolioId: input.portfolioId ?? null,
      });
      return { id };
    }),

  createBulk: protectedProcedure
    .input(z.object({ alerts: z.array(CreateInputSchema).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const rows = input.alerts.map((a) => ({
        id: randomUUID(),
        userId: ctx.user.id,
        symbol: a.symbol.toUpperCase(),
        conditionType: a.conditionType,
        threshold: String(a.threshold),
        indicatorParams: normalizeParams(a.conditionType, a.indicatorParams),
        source: a.source,
        assetType: a.assetType ?? null,
        strategyKind: a.strategyKind ?? null,
        portfolioId: a.portfolioId ?? null,
      }));
      await ctx.db.transaction(async (tx) => {
        for (const row of rows) {
          await tx.insert(alert).values(row);
        }
      });
      return { count: rows.length, ids: rows.map((r) => r.id) };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      conditionType: ConditionSchema.optional(),
      threshold: z.number().min(0).optional(),
      indicatorParams: IndicatorParamsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.alert.findFirst({
        where: and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      const nextType = input.conditionType ?? (existing.conditionType as z.infer<typeof ConditionSchema>);
      const nextParams =
        input.indicatorParams !== undefined || input.conditionType
          ? normalizeParams(nextType, input.indicatorParams)
          : (existing.indicatorParams as AlertIndicatorParams | null);
      await ctx.db
        .update(alert)
        .set({
          ...(input.conditionType ? { conditionType: input.conditionType } : {}),
          ...(input.threshold != null ? { threshold: String(input.threshold) } : {}),
          indicatorParams: nextParams ?? null,
          triggeredAt: null,
        })
        .where(and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)));
      return { id: input.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(alert).where(and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)));
      return { id: input.id };
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(alert)
        .set({ enabled: input.enabled, ...(input.enabled ? { triggeredAt: null } : {}) })
        .where(and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)));
      return { id: input.id };
    }),

  toggleMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(500), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(alert)
        .set({ enabled: input.enabled, ...(input.enabled ? { triggeredAt: null } : {}) })
        .where(and(inArray(alert.id, input.ids), eq(alert.userId, ctx.user.id)));
      return { count: input.ids.length };
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(alert)
        .where(and(inArray(alert.id, input.ids), eq(alert.userId, ctx.user.id)));
      return { count: input.ids.length };
    }),
});
