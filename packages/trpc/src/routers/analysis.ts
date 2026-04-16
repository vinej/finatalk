import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { analysis, savedChart } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  ConvertToSchema,
  IntervalSchema,
  RangeSchema,
  StoredIndicator,
  SymbolSchema,
} from "../schemas/indicator";

const TitleSchema = z.string().trim().min(1).max(120);
const DescriptionSchema = z.string().max(2000);
const IndicatorsSchema = z.array(StoredIndicator).max(10);

const StoredIndicatorArray = z.array(StoredIndicator);

function parseIndicators(value: unknown) {
  return StoredIndicatorArray.parse(value);
}

async function findOwnedAnalysis(ctx: { db: typeof import("@finatalk/db").db; user: { id: string } }, id: string) {
  const row = await ctx.db.query.analysis.findFirst({
    where: and(eq(analysis.id, id), eq(analysis.userId, ctx.user.id)),
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND" });
  return row;
}

async function findOwnedSavedChart(ctx: { db: typeof import("@finatalk/db").db; user: { id: string } }, id: string) {
  const row = await ctx.db.query.savedChart.findFirst({
    where: and(eq(savedChart.id, id), eq(savedChart.userId, ctx.user.id)),
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND" });
  return row;
}

export const analysisRouter = createTRPCRouter({
  // ── Analyses ─────────────────────────────────────────────────────────────
  listAnalyses: protectedProcedure
    .input(z.object({ symbol: SymbolSchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const filter = input?.symbol
        ? and(eq(analysis.userId, ctx.user.id), eq(analysis.symbol, input.symbol.toUpperCase()))
        : eq(analysis.userId, ctx.user.id);
      const rows = await ctx.db
        .select({
          id: analysis.id,
          symbol: analysis.symbol,
          title: analysis.title,
          description: analysis.description,
          indicators: analysis.indicators,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
        })
        .from(analysis)
        .where(filter)
        .orderBy(desc(analysis.createdAt));
      return rows.map((r) => {
        const items = parseIndicators(r.indicators);
        return {
          id: r.id,
          symbol: r.symbol,
          title: r.title,
          description: r.description,
          indicatorCount: items.length,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      });
    }),

  getAnalysis: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await findOwnedAnalysis(ctx, input.id);
      return {
        id: row.id,
        symbol: row.symbol,
        title: row.title,
        description: row.description,
        indicators: parseIndicators(row.indicators),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }),

  createAnalysis: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      title: TitleSchema,
      description: DescriptionSchema.default(""),
      indicators: IndicatorsSchema,
      overwrite: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sym = input.symbol.toUpperCase();
      const existing = await ctx.db.query.analysis.findFirst({
        where: and(
          eq(analysis.userId, ctx.user.id),
          eq(analysis.symbol, sym),
          eq(analysis.title, input.title),
        ),
      });
      if (existing) {
        if (!input.overwrite) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `An analysis titled "${input.title}" already exists for ${sym}.`,
          });
        }
        await ctx.db
          .update(analysis)
          .set({
            description: input.description,
            indicators: input.indicators,
            updatedAt: new Date(),
          })
          .where(eq(analysis.id, existing.id));
        return { id: existing.id, overwritten: true };
      }
      const id = randomUUID();
      await ctx.db.insert(analysis).values({
        id,
        userId: ctx.user.id,
        symbol: sym,
        title: input.title,
        description: input.description,
        indicators: input.indicators,
      });
      return { id, overwritten: false };
    }),

  updateAnalysis: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: TitleSchema.optional(),
      description: DescriptionSchema.optional(),
      indicators: IndicatorsSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedAnalysis(ctx, input.id);
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) values.title = input.title;
      if (input.description !== undefined) values.description = input.description;
      if (input.indicators !== undefined) values.indicators = input.indicators;
      await ctx.db
        .update(analysis)
        .set(values)
        .where(and(eq(analysis.id, input.id), eq(analysis.userId, ctx.user.id)));
      return { id: input.id };
    }),

  deleteAnalysis: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedAnalysis(ctx, input.id);
      await ctx.db
        .delete(analysis)
        .where(and(eq(analysis.id, input.id), eq(analysis.userId, ctx.user.id)));
      return { id: input.id };
    }),

  // ── Saved charts ─────────────────────────────────────────────────────────
  listSavedCharts: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: savedChart.id,
        title: savedChart.title,
        symbol: savedChart.symbol,
        range: savedChart.range,
        interval: savedChart.interval,
        convertTo: savedChart.convertTo,
        createdAt: savedChart.createdAt,
        updatedAt: savedChart.updatedAt,
      })
      .from(savedChart)
      .where(eq(savedChart.userId, ctx.user.id))
      .orderBy(desc(savedChart.createdAt));
    return rows;
  }),

  getSavedChart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const row = await findOwnedSavedChart(ctx, input.id);
      return {
        id: row.id,
        title: row.title,
        symbol: row.symbol,
        range: RangeSchema.parse(row.range),
        interval: IntervalSchema.parse(row.interval),
        convertTo: ConvertToSchema.parse(row.convertTo),
        indicators: parseIndicators(row.indicators),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }),

  createSavedChart: protectedProcedure
    .input(z.object({
      title: TitleSchema,
      symbol: SymbolSchema,
      range: RangeSchema,
      interval: IntervalSchema,
      convertTo: ConvertToSchema.optional(),
      indicators: IndicatorsSchema,
      overwrite: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.savedChart.findFirst({
        where: and(eq(savedChart.userId, ctx.user.id), eq(savedChart.title, input.title)),
      });
      if (existing) {
        if (!input.overwrite) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `A chart titled "${input.title}" already exists.`,
          });
        }
        await ctx.db
          .update(savedChart)
          .set({
            symbol: input.symbol.toUpperCase(),
            range: input.range,
            interval: input.interval,
            convertTo: input.convertTo ?? null,
            indicators: input.indicators,
            updatedAt: new Date(),
          })
          .where(eq(savedChart.id, existing.id));
        return { id: existing.id, overwritten: true };
      }
      const id = randomUUID();
      await ctx.db.insert(savedChart).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        symbol: input.symbol.toUpperCase(),
        range: input.range,
        interval: input.interval,
        convertTo: input.convertTo ?? null,
        indicators: input.indicators,
      });
      return { id, overwritten: false };
    }),

  deleteSavedChart: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedSavedChart(ctx, input.id);
      await ctx.db
        .delete(savedChart)
        .where(and(eq(savedChart.id, input.id), eq(savedChart.userId, ctx.user.id)));
      return { id: input.id };
    }),
});
