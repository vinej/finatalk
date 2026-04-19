import { createTool } from "@mastra/core/tools";
import { getOpenBBClient, isOpenBBEnabled } from "@finatalk/openbb";
import { z } from "zod";

export const getAnalystInfo = createTool({
  id: "getAnalystInfo",
  description:
    "Fetch Wall Street analyst consensus for a ticker: average price target, high/low targets, " +
    "recommendation (buy/hold/sell), number of covering analysts, current price. " +
    "Use this to compare upside vs. current price before recommending HOLD/TRIM/REPLACE.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, MSFT"),
  }),
  execute: async ({ symbol }) => {
    if (!isOpenBBEnabled()) return { available: false, symbol } as const;
    const providers = ["yfinance", "fmp"];
    for (const provider of providers) {
      try {
        const result = await getOpenBBClient().getAnalystConsensus(symbol, provider);
        if (result) {
          const upsidePct =
            result.currentPrice && result.targetMean
              ? ((result.targetMean - result.currentPrice) / result.currentPrice) * 100
              : null;
          return {
            available: true as const,
            symbol: result.symbol,
            currentPrice: result.currentPrice,
            targetMean: result.targetMean,
            targetHigh: result.targetHigh,
            targetLow: result.targetLow,
            upsidePct: upsidePct != null ? Math.round(upsidePct * 10) / 10 : null,
            recommendation: result.recommendation,
            numberOfAnalysts: result.numberOfAnalysts,
            provider,
          };
        }
      } catch {
        // try next provider
      }
    }
    return { available: false as const, symbol };
  },
});

export const getRecentHeadlines = createTool({
  id: "getRecentHeadlines",
  description:
    "Fetch the most recent news headlines for a ticker. Use this to check for material events " +
    "(earnings, guidance cuts, M&A, lawsuits, downgrades) that should influence HOLD/TRIM/REPLACE.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, MSFT"),
    limit: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ symbol, limit }) => {
    if (!isOpenBBEnabled()) return { available: false as const, symbol, headlines: [] };
    try {
      const articles = await getOpenBBClient().getCompanyNews(symbol, { limit: limit ?? 5 });
      const headlines = articles.slice(0, limit ?? 5).map((a) => ({
        title: a.title,
        source: a.source,
        publishedAt: a.publishedAt,
        summary: a.summary ? a.summary.slice(0, 400) : null,
      }));
      return { available: true as const, symbol, headlines };
    } catch {
      return { available: false as const, symbol, headlines: [] };
    }
  },
});
