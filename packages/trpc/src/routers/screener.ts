import { eq } from "drizzle-orm";
import { z } from "zod";
import { holding, portfolio, watchlist, watchlistItem } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";
import { fetchCandlesWithCurrency, getCachedSymbols } from "./market";
import { RSI, SMA, EMA } from "trading-signals";

const FiltersSchema = z.object({
  priceMin: z.number().nonnegative().nullable(),
  priceMax: z.number().positive().nullable(),
  rsiMin: z.number().min(0).max(100).nullable(),
  rsiMax: z.number().min(0).max(100).nullable(),
  rsiPeriod: z.number().int().min(2).max(100).default(14),
  aboveSma: z.number().int().min(2).max(500).nullable(),
  belowSma: z.number().int().min(2).max(500).nullable(),
  maType: z.enum(["sma", "ema"]).default("sma"),
  dividendYieldMin: z.number().nonnegative().nullable(),
});

export type ScreenerFilters = z.infer<typeof FiltersSchema>;

export type ScreenerRow = {
  symbol: string;
  name: string | null;
  lastClose: number;
  rsi: number | null;
  sma50: number | null;
  sma200: number | null;
  dividendYield: number | null;
  change1d: number | null;
};

export const screenerRouter = createTRPCRouter({
  getSymbolSources: protectedProcedure.query(async ({ ctx }) => {
    const wl = await ctx.db.query.watchlist.findFirst({
      where: eq(watchlist.userId, ctx.user.id),
    });
    let watchlistSymbols: string[] = [];
    if (wl) {
      const items = await ctx.db
        .select({ symbol: watchlistItem.symbol })
        .from(watchlistItem)
        .where(eq(watchlistItem.watchlistId, wl.id));
      watchlistSymbols = items.map((i) => i.symbol);
    }

    const portfolios = await ctx.db
      .select({ id: portfolio.id })
      .from(portfolio)
      .where(eq(portfolio.userId, ctx.user.id));
    const portfolioSymbols = new Set<string>();
    for (const p of portfolios) {
      const rows = await ctx.db
        .select({ symbol: holding.symbol })
        .from(holding)
        .where(eq(holding.portfolioId, p.id));
      for (const r of rows) portfolioSymbols.add(r.symbol.toUpperCase());
    }

    return {
      watchlist: watchlistSymbols,
      portfolio: [...portfolioSymbols],
    };
  }),

  scan: protectedProcedure
    .input(z.object({
      symbols: z.array(SymbolSchema).min(1).max(100),
      filters: FiltersSchema,
    }))
    .mutation(async ({ input }) => {
      const { symbols, filters } = input;
      const cached = await getCachedSymbols();
      const nameMap = new Map<string, string>();
      for (const s of cached.data) nameMap.set(s.symbol, s.name);

      const results: ScreenerRow[] = [];

      const settled = await Promise.allSettled(
        symbols.map(async (symbol): Promise<ScreenerRow | null> => {
          try {
            const { candles } = await fetchCandlesWithCurrency(symbol, "1y", "1d", null);
            if (candles.length < 2) return null;

            const last = candles[candles.length - 1]!;
            const prev = candles[candles.length - 2]!;
            const lastClose = last.close;
            const change1d = prev.close !== 0
              ? ((lastClose - prev.close) / prev.close) * 100
              : null;

            if (filters.priceMin != null && lastClose < filters.priceMin) return null;
            if (filters.priceMax != null && lastClose > filters.priceMax) return null;

            let rsi: number | null = null;
            const rsiInd = new RSI(filters.rsiPeriod);
            for (const c of candles) {
              const v = rsiInd.update(c.close, false);
              if (v != null) rsi = Number(v);
            }
            if (filters.rsiMin != null && (rsi == null || rsi < filters.rsiMin)) return null;
            if (filters.rsiMax != null && (rsi == null || rsi > filters.rsiMax)) return null;

            let sma50: number | null = null;
            const sma50Ind = new SMA(50);
            for (const c of candles) {
              const v = sma50Ind.update(c.close, false);
              if (v != null) sma50 = Number(v);
            }

            let sma200: number | null = null;
            if (candles.length >= 200) {
              const sma200Ind = new SMA(200);
              for (const c of candles) {
                const v = sma200Ind.update(c.close, false);
                if (v != null) sma200 = Number(v);
              }
            }

            if (filters.aboveSma != null) {
              const maInd = filters.maType === "ema" ? new EMA(filters.aboveSma) : new SMA(filters.aboveSma);
              let maVal: number | null = null;
              for (const c of candles) {
                const v = maInd.update(c.close, false);
                if (v != null) maVal = Number(v);
              }
              if (maVal == null || lastClose <= maVal) return null;
            }

            if (filters.belowSma != null) {
              const maInd = filters.maType === "ema" ? new EMA(filters.belowSma) : new SMA(filters.belowSma);
              let maVal: number | null = null;
              for (const c of candles) {
                const v = maInd.update(c.close, false);
                if (v != null) maVal = Number(v);
              }
              if (maVal == null || lastClose >= maVal) return null;
            }

            return {
              symbol,
              name: nameMap.get(symbol) ?? null,
              lastClose,
              rsi,
              sma50,
              sma200,
              dividendYield: null,
              change1d,
            };
          } catch {
            return null;
          }
        }),
      );

      for (const r of settled) {
        if (r.status === "fulfilled" && r.value != null) {
          results.push(r.value);
        }
      }

      results.sort((a, b) => a.symbol.localeCompare(b.symbol));
      return { results, scannedAt: new Date().toISOString() };
    }),
});
