import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getOpenBBClient, isOpenBBEnabled, type NewsArticle } from "@finatalk/openbb";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";

function dedupeByUrl(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  const out: NewsArticle[] = [];
  for (const a of articles) {
    if (!a.url || seen.has(a.url)) continue;
    seen.add(a.url);
    out.push(a);
  }
  return out;
}

function sortByDateDesc(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}

export const newsRouter = createTRPCRouter({
  getWorldNews: protectedProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (!isOpenBBEnabled()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenBB is not enabled." });
      }
      const client = getOpenBBClient();

      // Try /news/world providers first (most need API keys).
      const providers = input.provider ? [input.provider] : ["fmp", "benzinga"];
      for (const provider of providers) {
        try {
          const articles = await client.getWorldNews({ limit: input.limit, provider });
          if (articles.length > 0) return sortByDateDesc(dedupeByUrl(articles));
        } catch {
          // try next provider
        }
      }

      // Fallback: aggregate news for major market ETFs (keyless via yfinance).
      const marketProxies = ["SPY", "QQQ", "DIA", "IWM"];
      const perSymbol = Math.max(5, Math.ceil(input.limit / marketProxies.length));
      const results = await Promise.all(
        marketProxies.map((s) =>
          client.getCompanyNews(s, { limit: perSymbol, provider: "yfinance" }).catch(() => [] as NewsArticle[]),
        ),
      );
      return sortByDateDesc(dedupeByUrl(results.flat())).slice(0, input.limit);
    }),

  getCompanyNews: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      limit: z.number().int().min(1).max(100).default(25),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (!isOpenBBEnabled()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenBB is not enabled." });
      }
      try {
        const opts: { limit: number; provider?: string } = { limit: input.limit };
        if (input.provider) opts.provider = input.provider;
        const articles = await getOpenBBClient().getCompanyNews(input.symbol, opts);
        return sortByDateDesc(dedupeByUrl(articles));
      } catch {
        return [];
      }
    }),

  getMyNews: protectedProcedure
    .input(z.object({
      symbols: z.array(SymbolSchema).max(30),
      perSymbolLimit: z.number().int().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      if (!isOpenBBEnabled()) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenBB is not enabled." });
      }
      if (input.symbols.length === 0) return [];
      const client = getOpenBBClient();
      const results = await Promise.all(
        input.symbols.map((s) =>
          client.getCompanyNews(s, { limit: input.perSymbolLimit }).catch(() => [] as NewsArticle[]),
        ),
      );
      return sortByDateDesc(dedupeByUrl(results.flat()));
    }),
});
