import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { analysis, holding, portfolio, type Holding } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  CurrencySchema,
  HoldingInputSchema,
  PortfolioTitleSchema,
} from "../schemas/portfolio";
import { SymbolSchema } from "../schemas/indicator";
import { generatePortfolioReport } from "../lib/pdf-report";
import { fetchCandlesWithCurrency } from "./market";

type OwnedCtx = { db: typeof import("@finatalk/db").db; user: { id: string } };

async function findOwnedPortfolio(ctx: OwnedCtx, id: string) {
  const row = await ctx.db.query.portfolio.findFirst({
    where: and(eq(portfolio.id, id), eq(portfolio.userId, ctx.user.id)),
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND" });
  return row;
}

async function findOwnedHolding(ctx: OwnedCtx, holdingId: string) {
  const h = await ctx.db.query.holding.findFirst({
    where: eq(holding.id, holdingId),
  });
  if (!h) throw new TRPCError({ code: "NOT_FOUND" });
  const p = await ctx.db.query.portfolio.findFirst({
    where: and(eq(portfolio.id, h.portfolioId), eq(portfolio.userId, ctx.user.id)),
  });
  if (!p) throw new TRPCError({ code: "NOT_FOUND" });
  return { holding: h, portfolio: p };
}

function serializeHolding(row: Holding) {
  return {
    id: row.id,
    portfolioId: row.portfolioId,
    symbol: row.symbol,
    quantity: Number(row.quantity),
    costBasis: Number(row.costBasis),
    purchaseDate: row.purchaseDate,
    analysisId: row.analysisId ?? null,
    confidence: (row.confidence as "high" | "medium" | "low") ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const portfolioRouter = createTRPCRouter({
  listPortfolios: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(portfolio)
      .where(eq(portfolio.userId, ctx.user.id))
      .orderBy(desc(portfolio.createdAt));

    const counts = await Promise.all(
      rows.map((p) =>
        ctx.db.query.holding.findMany({
          where: eq(holding.portfolioId, p.id),
          columns: { id: true },
        }),
      ),
    );

    return rows.map((p, i) => ({
      id: p.id,
      title: p.title,
      currency: CurrencySchema.parse(p.currency),
      holdingCount: counts[i]!.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }),

  getPortfolio: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.id);
      const rows = await ctx.db
        .select({ h: holding, analysisTitle: analysis.title, analysisDescription: analysis.description })
        .from(holding)
        .leftJoin(analysis, eq(analysis.id, holding.analysisId))
        .where(eq(holding.portfolioId, p.id))
        .orderBy(asc(holding.symbol), asc(holding.createdAt));
      return {
        id: p.id,
        title: p.title,
        currency: CurrencySchema.parse(p.currency),
        holdings: rows.map((r) => ({
          ...serializeHolding(r.h),
          analysisTitle: r.analysisTitle ?? null,
          analysisDescription: r.analysisDescription ?? null,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    }),

  createPortfolio: protectedProcedure
    .input(z.object({
      title: PortfolioTitleSchema,
      currency: CurrencySchema,
      overwrite: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.portfolio.findFirst({
        where: and(eq(portfolio.userId, ctx.user.id), eq(portfolio.title, input.title)),
      });
      if (existing) {
        if (!input.overwrite) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `A portfolio titled "${input.title}" already exists.`,
          });
        }
        await ctx.db
          .update(portfolio)
          .set({ currency: input.currency, updatedAt: new Date() })
          .where(eq(portfolio.id, existing.id));
        return { id: existing.id, overwritten: true };
      }
      const id = randomUUID();
      await ctx.db.insert(portfolio).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        currency: input.currency,
      });
      return { id, overwritten: false };
    }),

  updatePortfolio: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: PortfolioTitleSchema.optional(),
      currency: CurrencySchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedPortfolio(ctx, input.id);
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) {
        const duplicate = await ctx.db.query.portfolio.findFirst({
          where: and(
            eq(portfolio.userId, ctx.user.id),
            eq(portfolio.title, input.title),
          ),
        });
        if (duplicate && duplicate.id !== input.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `A portfolio titled "${input.title}" already exists.`,
          });
        }
        values.title = input.title;
      }
      if (input.currency !== undefined) values.currency = input.currency;
      await ctx.db
        .update(portfolio)
        .set(values)
        .where(and(eq(portfolio.id, input.id), eq(portfolio.userId, ctx.user.id)));
      return { id: input.id };
    }),

  deletePortfolio: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedPortfolio(ctx, input.id);
      await ctx.db
        .delete(portfolio)
        .where(and(eq(portfolio.id, input.id), eq(portfolio.userId, ctx.user.id)));
      return { id: input.id };
    }),

  addHolding: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      holding: HoldingInputSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedPortfolio(ctx, input.portfolioId);
      const id = randomUUID();
      await ctx.db.insert(holding).values({
        id,
        portfolioId: input.portfolioId,
        symbol: input.holding.symbol.toUpperCase(),
        quantity: String(input.holding.quantity),
        costBasis: String(input.holding.costBasis),
        purchaseDate: input.holding.purchaseDate,
      });
      await ctx.db
        .update(portfolio)
        .set({ updatedAt: new Date() })
        .where(eq(portfolio.id, input.portfolioId));
      return { id };
    }),

  updateHolding: protectedProcedure
    .input(z.object({
      id: z.string(),
      holding: HoldingInputSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { holding: current, portfolio: p } = await findOwnedHolding(ctx, input.id);
      const nextSymbol = input.holding.symbol.toUpperCase();
      const symbolChanged = current.symbol.toUpperCase() !== nextSymbol;
      await ctx.db
        .update(holding)
        .set({
          symbol: nextSymbol,
          quantity: String(input.holding.quantity),
          costBasis: String(input.holding.costBasis),
          purchaseDate: input.holding.purchaseDate,
          ...(symbolChanged && current.analysisId ? { analysisId: null } : {}),
          updatedAt: new Date(),
        })
        .where(eq(holding.id, input.id));
      await ctx.db
        .update(portfolio)
        .set({ updatedAt: new Date() })
        .where(eq(portfolio.id, p.id));
      return { id: input.id };
    }),

  deleteHolding: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { portfolio: p } = await findOwnedHolding(ctx, input.id);
      await ctx.db.delete(holding).where(eq(holding.id, input.id));
      await ctx.db
        .update(portfolio)
        .set({ updatedAt: new Date() })
        .where(eq(portfolio.id, p.id));
      return { id: input.id };
    }),

  getValuation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.id);
      const currency = CurrencySchema.parse(p.currency);
      const holdings = await ctx.db.query.holding.findMany({
        where: eq(holding.portfolioId, p.id),
        orderBy: [asc(holding.symbol), asc(holding.createdAt)],
      });
      const uniqueSymbols = Array.from(
        new Set(holdings.map((h) => h.symbol.toUpperCase())),
      );

      type PriceInfo = {
        lastClose: number | null;
        nativeCurrency: string | null;
        displayCurrency: string | null;
        error: string | null;
      };

      const priceEntries = await Promise.all(
        uniqueSymbols.map(async (symbol): Promise<[string, PriceInfo]> => {
          try {
            const { candles, nativeCurrency, displayCurrency } =
              await fetchCandlesWithCurrency(symbol, "1mo", "1d", currency);
            const last = candles[candles.length - 1];
            if (!last) {
              return [symbol, { lastClose: null, nativeCurrency, displayCurrency, error: "no data" }];
            }
            return [symbol, { lastClose: last.close, nativeCurrency, displayCurrency, error: null }];
          } catch (err) {
            return [
              symbol,
              {
                lastClose: null,
                nativeCurrency: null,
                displayCurrency: null,
                error: err instanceof Error ? err.message : String(err),
              },
            ];
          }
        }),
      );
      const pricesBySymbol = new Map<string, PriceInfo>(priceEntries);

      const rows = holdings.map((h) => {
        const info = pricesBySymbol.get(h.symbol.toUpperCase())!;
        const hNum = serializeHolding(h);
        const costTotal = hNum.quantity * hNum.costBasis;
        if (info.lastClose == null) {
          return {
            holding: hNum,
            lastClose: null,
            marketValue: null,
            costTotal,
            unrealizedAbs: null,
            unrealizedPct: null,
            nativeCurrency: info.nativeCurrency,
            error: info.error ?? "no price",
          };
        }
        const marketValue = hNum.quantity * info.lastClose;
        const unrealizedAbs = marketValue - costTotal;
        const unrealizedPct = costTotal > 0 ? (unrealizedAbs / costTotal) * 100 : null;
        return {
          holding: hNum,
          lastClose: info.lastClose,
          marketValue,
          costTotal,
          unrealizedAbs,
          unrealizedPct,
          nativeCurrency: info.nativeCurrency,
          error: null as string | null,
        };
      });

      const valued = rows.filter((r) => r.marketValue != null);
      const totalMV = valued.reduce((s, r) => s + (r.marketValue ?? 0), 0);
      const totalCost = valued.reduce((s, r) => s + r.costTotal, 0);
      const totalAbs = totalMV - totalCost;
      const totalPct = totalCost > 0 ? (totalAbs / totalCost) * 100 : null;

      return {
        id: p.id,
        title: p.title,
        currency,
        asOf: new Date(),
        rows,
        totals: {
          marketValue: totalMV,
          costTotal: totalCost,
          unrealizedAbs: totalAbs,
          unrealizedPct: totalPct,
        },
      };
    }),

  linkAnalysisToHolding: protectedProcedure
    .input(z.object({
      holdingId: z.string(),
      analysisId: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { holding: h, portfolio: p } = await findOwnedHolding(ctx, input.holdingId);
      if (input.analysisId !== null) {
        const owned = await ctx.db.query.analysis.findFirst({
          where: and(eq(analysis.id, input.analysisId), eq(analysis.userId, ctx.user.id)),
        });
        if (!owned) throw new TRPCError({ code: "NOT_FOUND" });
        if (owned.symbol.toUpperCase() !== h.symbol.toUpperCase()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `This analysis is bound to ${owned.symbol}, not ${h.symbol}.`,
          });
        }
      }
      await ctx.db
        .update(holding)
        .set({ analysisId: input.analysisId, updatedAt: new Date() })
        .where(eq(holding.id, input.holdingId));
      await ctx.db
        .update(portfolio)
        .set({ updatedAt: new Date() })
        .where(eq(portfolio.id, p.id));
      return { holdingId: input.holdingId, analysisId: input.analysisId };
    }),

  updateHoldingConfidence: protectedProcedure
    .input(z.object({
      portfolioId: z.string(),
      symbol: z.string().trim().min(1).max(20),
      confidence: z.enum(["high", "medium", "low"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.portfolioId);
      const sym = input.symbol.toUpperCase();
      const rows = await ctx.db.query.holding.findMany({
        where: and(eq(holding.portfolioId, p.id)),
      });
      const matched = rows.filter((r) => r.symbol.toUpperCase() === sym);
      if (matched.length === 0) throw new TRPCError({ code: "NOT_FOUND" });
      for (const h of matched) {
        await ctx.db
          .update(holding)
          .set({ confidence: input.confidence, updatedAt: new Date() })
          .where(eq(holding.id, h.id));
      }
      return { symbol: sym, confidence: input.confidence };
    }),

  generateAnalysisForSymbol: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.generateAnalysis;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI analysis generation is not configured on this server.",
        });
      }
      return fn({
        symbol: input.symbol.toUpperCase(),
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  generatePortfolioFromPrompt: protectedProcedure
    .input(z.object({
      prompt: z.string().trim().min(3).max(2000),
      language: z.string().min(2).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const fn = ctx.services.generatePortfolio;
      if (!fn) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI portfolio generation is not configured on this server.",
        });
      }
      return fn({
        prompt: input.prompt,
        ...(input.language ? { language: input.language } : {}),
      });
    }),

  generateReport: protectedProcedure
    .input(z.object({
      id: z.string(),
      locale: z.string().min(2).max(10).default("en"),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.id);
      const currency = CurrencySchema.parse(p.currency);
      const holdings = await ctx.db.query.holding.findMany({
        where: eq(holding.portfolioId, p.id),
        orderBy: [asc(holding.symbol), asc(holding.createdAt)],
      });
      const uniqueSymbols = Array.from(
        new Set(holdings.map((h) => h.symbol.toUpperCase())),
      );

      type PriceInfo = {
        lastClose: number | null;
        error: string | null;
      };

      const priceEntries = await Promise.all(
        uniqueSymbols.map(async (symbol): Promise<[string, PriceInfo]> => {
          try {
            const { candles } = await fetchCandlesWithCurrency(symbol, "1mo", "1d", currency);
            const last = candles[candles.length - 1];
            if (!last) return [symbol, { lastClose: null, error: "no data" }];
            return [symbol, { lastClose: last.close, error: null }];
          } catch {
            return [symbol, { lastClose: null, error: "fetch failed" }];
          }
        }),
      );
      const pricesBySymbol = new Map<string, PriceInfo>(priceEntries);

      const rows = holdings.map((h) => {
        const info = pricesBySymbol.get(h.symbol.toUpperCase())!;
        const qty = Number(h.quantity);
        const cost = Number(h.costBasis);
        const costTotal = qty * cost;
        const marketValue = info.lastClose != null ? qty * info.lastClose : null;
        const unrealizedAbs = marketValue != null ? marketValue - costTotal : null;
        const unrealizedPct = unrealizedAbs != null && costTotal > 0 ? (unrealizedAbs / costTotal) * 100 : null;
        return {
          symbol: h.symbol,
          quantity: qty,
          costBasis: cost,
          lastClose: info.lastClose,
          marketValue,
          costTotal,
          unrealizedAbs,
          unrealizedPct,
          weight: null as number | null,
          confidence: (h.confidence as "high" | "medium" | "low") ?? null,
        };
      });

      const totalMV = rows.reduce((s, r) => s + (r.marketValue ?? 0), 0);
      for (const r of rows) {
        if (r.marketValue != null && totalMV > 0) {
          r.weight = (r.marketValue / totalMV) * 100;
        }
      }
      const totalCost = rows.reduce((s, r) => s + r.costTotal, 0);
      const totalAbs = totalMV - totalCost;
      const totalPct = totalCost > 0 ? (totalAbs / totalCost) * 100 : null;

      const pdfBuffer = await generatePortfolioReport({
        title: p.title,
        currency,
        asOf: new Date().toLocaleDateString(input.locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        rows,
        totals: {
          marketValue: totalMV,
          costTotal: totalCost,
          unrealizedAbs: totalAbs,
          unrealizedPct: totalPct,
        },
        locale: input.locale,
      });

      return {
        base64: pdfBuffer.toString("base64"),
        filename: `${p.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}-report.pdf`,
      };
    }),
});
