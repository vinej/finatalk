import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { analysis, holding, portfolio, transaction, type Holding, type Transaction } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  AccountTypeSchema,
  CurrencySchema,
  HoldingInputSchema,
  PortfolioTitleSchema,
} from "../schemas/portfolio";
import { RangeSchema, SymbolSchema } from "../schemas/indicator";
import { IdInput } from "../schemas/common";
import { generatePortfolioReport } from "../lib/pdf-report";
import { fetchCandlesWithCurrency, fetchDividendInfo } from "./market";
import { resolveAssetType } from "../lib/market-provider";
import { paletteColor } from "../constants/chart";

const TransactionTypeSchema = z.enum(["buy", "sell", "dividend"]);

const TransactionInputSchema = z.object({
  type: TransactionTypeSchema,
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  fee: z.number().nonnegative().default(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  note: z.string().max(500).optional(),
});

type AcbResult = {
  totalShares: number;
  acbPerShare: number;
  acbTotal: number;
  realizedGains: number;
  transactions: Array<{
    id: string;
    type: string;
    quantity: number;
    price: number;
    fee: number;
    date: string;
    note: string | null;
    realizedGain: number | null;
    acbPerShareAfter: number;
    sharesAfter: number;
    createdAt: Date;
  }>;
};

function computeAcb(rows: Transaction[]): AcbResult {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.getTime() - b.createdAt.getTime());
  let totalShares = 0;
  let acbTotal = 0;
  let realizedGains = 0;

  const transactions: AcbResult["transactions"] = [];

  for (const tx of sorted) {
    const qty = Number(tx.quantity);
    const price = Number(tx.price);
    const fee = Number(tx.fee);

    let realizedGain: number | null = null;

    if (tx.type === "buy") {
      acbTotal += qty * price + fee;
      totalShares += qty;
    } else if (tx.type === "sell") {
      const acbPerShare = totalShares > 0 ? acbTotal / totalShares : 0;
      const proceeds = qty * price - fee;
      realizedGain = proceeds - acbPerShare * qty;
      realizedGains += realizedGain;
      acbTotal -= acbPerShare * qty;
      totalShares -= qty;
      if (totalShares < 0.00000001) {
        totalShares = 0;
        acbTotal = 0;
      }
    } else if (tx.type === "dividend") {
      realizedGain = qty * price - fee;
      realizedGains += realizedGain;
    }

    transactions.push({
      id: tx.id,
      type: tx.type,
      quantity: qty,
      price,
      fee,
      date: tx.date,
      note: tx.note ?? null,
      realizedGain,
      acbPerShareAfter: totalShares > 0 ? acbTotal / totalShares : 0,
      sharesAfter: totalShares,
      createdAt: tx.createdAt,
    });
  }

  return {
    totalShares,
    acbPerShare: totalShares > 0 ? acbTotal / totalShares : 0,
    acbTotal,
    realizedGains,
    transactions,
  };
}

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
    assetType: (row.assetType as "equity" | "etf" | "mutualfund" | "index" | "crypto" | "currency" | "future" | "option") ?? null,
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
      accountType: p.accountType ?? null,
      manageTransactions: p.manageTransactions ?? false,
      strategyKind: p.strategyKind ?? null,
      holdingCount: counts[i]!.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }),

  getPortfolio: protectedProcedure
    .input(IdInput)
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
        accountType: p.accountType ?? null,
        manageTransactions: p.manageTransactions ?? false,
        strategyKind: p.strategyKind ?? null,
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
      accountType: AccountTypeSchema.nullable().optional(),
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
          .set({ currency: input.currency, accountType: input.accountType ?? null, updatedAt: new Date() })
          .where(eq(portfolio.id, existing.id));
        return { id: existing.id, overwritten: true };
      }
      const id = randomUUID();
      await ctx.db.insert(portfolio).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        currency: input.currency,
        accountType: input.accountType ?? null,
      });
      return { id, overwritten: false };
    }),

  updatePortfolio: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: PortfolioTitleSchema.optional(),
      currency: CurrencySchema.optional(),
      accountType: AccountTypeSchema.nullable().optional(),
      manageTransactions: z.boolean().optional(),
      strategyKind: z.string().max(64).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await findOwnedPortfolio(ctx, input.id);
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (input.accountType !== undefined) values.accountType = input.accountType;
      if (input.manageTransactions !== undefined) values.manageTransactions = input.manageTransactions;
      if (input.strategyKind !== undefined) values.strategyKind = input.strategyKind;
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
    .input(IdInput)
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
      const symbol = input.holding.symbol;
      const assetType = await resolveAssetType(symbol);
      await ctx.db.insert(holding).values({
        id,
        portfolioId: input.portfolioId,
        symbol,
        quantity: String(input.holding.quantity),
        costBasis: String(input.holding.costBasis),
        purchaseDate: input.holding.purchaseDate,
        assetType: assetType ?? null,
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
      const nextSymbol = input.holding.symbol;
      const symbolChanged = current.symbol.toUpperCase() !== nextSymbol;
      const nextAssetType = symbolChanged ? await resolveAssetType(nextSymbol) : undefined;
      await ctx.db
        .update(holding)
        .set({
          symbol: nextSymbol,
          quantity: String(input.holding.quantity),
          costBasis: String(input.holding.costBasis),
          purchaseDate: input.holding.purchaseDate,
          ...(symbolChanged && current.analysisId ? { analysisId: null } : {}),
          ...(symbolChanged ? { assetType: nextAssetType ?? null } : {}),
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
    .input(IdInput)
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
    .input(IdInput)
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
      symbol: SymbolSchema,
      confidence: z.enum(["high", "medium", "low"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.portfolioId);
      const sym = input.symbol;
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

  listTransactions: protectedProcedure
    .input(z.object({ holdingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { holding: h } = await findOwnedHolding(ctx, input.holdingId);
      const rows = await ctx.db.query.transaction.findMany({
        where: eq(transaction.holdingId, h.id),
      });
      return computeAcb(rows);
    }),

  getPortfolioTaxSummary: protectedProcedure
    .input(IdInput)
    .query(async ({ ctx, input }) => {
      const p = await findOwnedPortfolio(ctx, input.id);
      const holdings = await ctx.db.query.holding.findMany({
        where: eq(holding.portfolioId, p.id),
      });
      const results = await Promise.all(
        holdings.map(async (h) => {
          const rows = await ctx.db.query.transaction.findMany({
            where: eq(transaction.holdingId, h.id),
          });
          if (rows.length === 0) return null;
          const acb = computeAcb(rows);
          return {
            symbol: h.symbol,
            holdingId: h.id,
            totalShares: acb.totalShares,
            acbPerShare: acb.acbPerShare,
            acbTotal: acb.acbTotal,
            realizedGains: acb.realizedGains,
            transactionCount: rows.length,
          };
        }),
      );
      const items = results.filter((r) => r !== null);
      const totalRealized = items.reduce((s, r) => s + r.realizedGains, 0);
      const taxableGains = totalRealized > 0 ? totalRealized * 0.5 : 0;
      return { items, totalRealized, taxableGains };
    }),

  addTransaction: protectedProcedure
    .input(z.object({
      holdingId: z.string(),
      transaction: TransactionInputSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { portfolio: p } = await findOwnedHolding(ctx, input.holdingId);
      const id = randomUUID();

      await ctx.db.transaction(async (tx) => {
        // Row-lock the holding for the duration of the transaction so that
        // concurrent add/delete transaction mutations serialize — prevents
        // TOCTOU oversell and stale quantity/costBasis writes.
        const locked = await tx
          .select({ id: holding.id })
          .from(holding)
          .where(eq(holding.id, input.holdingId))
          .for("update");
        if (locked.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

        if (input.transaction.type === "sell") {
          const existing = await tx.query.transaction.findMany({
            where: eq(transaction.holdingId, input.holdingId),
          });
          const acb = computeAcb(existing);
          if (input.transaction.quantity > acb.totalShares + 0.00000001) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Cannot sell ${input.transaction.quantity} shares — only ${acb.totalShares.toFixed(4)} held.`,
            });
          }
        }

        await tx.insert(transaction).values({
          id,
          holdingId: input.holdingId,
          type: input.transaction.type,
          quantity: String(input.transaction.quantity),
          price: String(input.transaction.price),
          fee: String(input.transaction.fee),
          date: input.transaction.date,
          note: input.transaction.note ?? null,
        });

        const allTx = await tx.query.transaction.findMany({
          where: eq(transaction.holdingId, input.holdingId),
        });
        const acb = computeAcb(allTx);
        await tx
          .update(holding)
          .set({
            quantity: String(acb.totalShares),
            costBasis: String(acb.acbPerShare),
            updatedAt: new Date(),
          })
          .where(eq(holding.id, input.holdingId));
        await tx
          .update(portfolio)
          .set({ updatedAt: new Date() })
          .where(eq(portfolio.id, p.id));
      });

      return { id };
    }),

  deleteTransaction: protectedProcedure
    .input(IdInput)
    .mutation(async ({ ctx, input }) => {
      const txRow = await ctx.db.query.transaction.findFirst({
        where: eq(transaction.id, input.id),
      });
      if (!txRow) throw new TRPCError({ code: "NOT_FOUND" });
      const { portfolio: p } = await findOwnedHolding(ctx, txRow.holdingId);

      await ctx.db.transaction(async (tx) => {
        const locked = await tx
          .select({ id: holding.id })
          .from(holding)
          .where(eq(holding.id, txRow.holdingId))
          .for("update");
        if (locked.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

        await tx.delete(transaction).where(eq(transaction.id, input.id));

        const remaining = await tx.query.transaction.findMany({
          where: eq(transaction.holdingId, txRow.holdingId),
        });
        const acb = computeAcb(remaining);
        await tx
          .update(holding)
          .set({
            quantity: String(acb.totalShares),
            costBasis: String(acb.acbPerShare),
            updatedAt: new Date(),
          })
          .where(eq(holding.id, txRow.holdingId));
        await tx
          .update(portfolio)
          .set({ updatedAt: new Date() })
          .where(eq(portfolio.id, p.id));
      });

      return { id: input.id };
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
        symbol: input.symbol,
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
      range: RangeSchema.default("6mo"),
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

      type SymbolData = {
        lastClose: number | null;
        points: { t: number; v: number }[];
      };

      const symbolEntries = await Promise.all(
        uniqueSymbols.map(async (symbol): Promise<[string, SymbolData]> => {
          try {
            const { candles } = await fetchCandlesWithCurrency(symbol, input.range, "1d", currency);
            if (candles.length === 0) return [symbol, { lastClose: null, points: [] }];
            const last = candles[candles.length - 1]!;
            const base = candles[0]!.close;
            const points =
              Number.isFinite(base) && base > 0
                ? candles.map((c) => ({ t: c.time, v: (c.close / base) * 100 }))
                : [];
            return [symbol, { lastClose: last.close, points }];
          } catch {
            return [symbol, { lastClose: null, points: [] }];
          }
        }),
      );
      const symbolData = new Map<string, SymbolData>(symbolEntries);
      const pricesBySymbol = new Map<string, { lastClose: number | null; error: string | null }>(
        symbolEntries.map(([s, d]) => [s, { lastClose: d.lastClose, error: null }]),
      );

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

      // ── Dividend income ─────────────────────────────────────
      const divInfos = await Promise.all(
        uniqueSymbols.map((s) => fetchDividendInfo(s)),
      );
      const divBySymbol = new Map(divInfos.map((d) => [d.symbol, d]));
      const dividendRows = holdings.map((h) => {
        const info = divBySymbol.get(h.symbol.toUpperCase())!;
        const qty = Number(h.quantity);
        const annual =
          info.dividendRate != null && info.dividendRate > 0
            ? qty * info.dividendRate
            : null;
        return {
          symbol: h.symbol,
          quantity: qty,
          dividendRate: info.dividendRate,
          dividendYield: info.dividendYield,
          annualIncome: annual,
          exDividendDate: info.exDividendDate,
          dividendDate: info.dividendDate,
        };
      });
      const totalAnnualIncome = dividendRows.reduce(
        (s, r) => s + (r.annualIncome ?? 0),
        0,
      );

      // ── Tax summary (ACB + realized gains) ──────────────────
      const taxItems = await Promise.all(
        holdings.map(async (h) => {
          const txRows = await ctx.db.query.transaction.findMany({
            where: eq(transaction.holdingId, h.id),
          });
          if (txRows.length === 0) return null;
          const acb = computeAcb(txRows);
          return {
            symbol: h.symbol,
            totalShares: acb.totalShares,
            acbPerShare: acb.acbPerShare,
            acbTotal: acb.acbTotal,
            realizedGains: acb.realizedGains,
            transactionCount: txRows.length,
          };
        }),
      );
      const taxRows = taxItems.filter((r) => r !== null);
      const totalRealized = taxRows.reduce((s, r) => s + r.realizedGains, 0);
      const taxableGains = totalRealized > 0 ? totalRealized * 0.5 : 0;

      const isFr = input.locale.toLowerCase().startsWith("fr");
      const labels = isFr
        ? {
            marketValue: "Valeur de marché",
            costBasis: "Coût d'achat",
            unrealizedPL: "P/V non réalisé",
            return: "Rendement",
            holdings: "Positions",
            allocation: "Répartition",
            total: "Total",
            dividendIncome: "Revenu de dividendes",
            annualIncome: "Revenu annuel",
            monthlyEstimate: "Estimation mensuelle",
            taxSummary: "Sommaire fiscal",
            totalRealized: "Gains réalisés totaux",
            taxableGains: "Gains imposables (50 %)",
            taxNote: "Taux d'inclusion de 50 % — consultez un fiscaliste.",
            noDividendData: "Aucune position versant un dividende.",
            noTransactionData: "Aucune transaction enregistrée.",
            footer:
              "Généré par FinaTalk. Ce rapport est à titre informatif seulement et ne constitue pas un conseil en placement.",
            colSymbol: "Symbole",
            colQty: "Qté",
            colAvgCost: "Coût moy.",
            colLast: "Dernier",
            colMktValue: "Val. marché",
            colCostBasis: "Coût d'achat",
            colPL: "P/V",
            colPLPct: "P/V %",
            colWeight: "Poids",
            colRate: "Taux",
            colYield: "Rend.",
            colAnnualEst: "Est. annuelle",
            colExDate: "Date ex-div.",
            colPayDate: "Date vers.",
            colShares: "Actions",
            colAcbPerShare: "PBR/action",
            colAcbTotal: "PBR total",
            colRealized: "Gain réalisé",
            colTxCount: "Txs",
          }
        : undefined;

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
        dividends: {
          rows: dividendRows,
          totalAnnualIncome,
          totalMonthlyEstimate: totalAnnualIncome / 12,
        },
        taxSummary: {
          rows: taxRows,
          totalRealized,
          taxableGains,
        },
        performance: {
          range: input.range,
          series: uniqueSymbols.map((symbol, i) => ({
            symbol,
            color: paletteColor(i),
            points: symbolData.get(symbol)?.points ?? [],
          })),
        },
        ...(labels ? { labels } : {}),
      });

      return {
        base64: pdfBuffer.toString("base64"),
        filename: `${p.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}-report.pdf`,
      };
    }),
});
