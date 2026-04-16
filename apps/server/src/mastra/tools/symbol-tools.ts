import { createTool } from "@mastra/core/tools";
import {
  fetchCandlesWithCurrency,
  getCachedSymbols,
  type SymbolEntry,
} from "@finatalk/trpc/routers/market";
import { z } from "zod";

const LIST_LIMIT_DEFAULT = 50;
const LIST_LIMIT_MAX = 200;

function matches(s: SymbolEntry, q: string): boolean {
  const sym = s.symbol.toUpperCase();
  const name = s.name.toUpperCase();
  return sym.startsWith(q) || sym.includes(q) || name.includes(q);
}

export const listAvailableSymbols = createTool({
  id: "listAvailableSymbols",
  description:
    "Search the universe of tradable tickers (NASDAQ + NYSE + ARCA). " +
    "Includes both stocks and ETFs — each result carries `assetType: 'stock' | 'etf'`. " +
    "Pass a query to match by ticker prefix or company name substring. " +
    "Use this to verify a symbol exists or to discover tickers for a theme " +
    "(e.g. 'bank' → JPM/BAC/WFC; 'bond' → AGG/BND/TLT; 'allocation' → AOR/AOA). " +
    "Returns up to `limit` entries.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Optional filter — ticker prefix or company name substring, case-insensitive."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(LIST_LIMIT_MAX)
      .optional()
      .describe(`Max entries to return (default ${LIST_LIMIT_DEFAULT}, hard cap ${LIST_LIMIT_MAX}).`),
  }),
  execute: async ({ query, limit: rawLimit }) => {
    const { data, fetchedAt } = await getCachedSymbols();
    const limit = rawLimit ?? LIST_LIMIT_DEFAULT;
    const q = query?.trim().toUpperCase();
    if (!q) {
      return {
        total: data.length,
        fetchedAt,
        symbols: data.slice(0, limit),
      };
    }
    const out: SymbolEntry[] = [];
    for (const s of data) {
      if (matches(s, q)) out.push(s);
      if (out.length >= limit) break;
    }
    return { total: data.length, fetchedAt, symbols: out };
  },
});

export const getLatestPrice = createTool({
  id: "getLatestPrice",
  description:
    "Fetch the latest close price for a ticker. Use this when sizing a holding to a budget — " +
    "divide the target allocation by the returned price to get a quantity. " +
    "If the ticker does not exist or has no data, this throws; pick a different ticker.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, MSFT, GIB.TO"),
    convertTo: z
      .enum(["USD", "CAD"])
      .optional()
      .describe("Return price in this currency. Omit for the ticker's native currency."),
  }),
  execute: async ({ symbol: rawSymbol, convertTo }) => {
    const symbol = rawSymbol.toUpperCase();
    const target = convertTo === "CAD" ? "CAD" : null;
    const { candles, nativeCurrency, displayCurrency } = await fetchCandlesWithCurrency(
      symbol,
      "1mo",
      "1d",
      target,
    );
    const last = candles[candles.length - 1];
    if (!last) {
      throw new Error(`No price data for ${symbol}`);
    }
    return {
      symbol,
      price: Math.round(last.close * 10000) / 10000,
      nativeCurrency,
      displayCurrency,
      asOf: new Date(last.time * 1000).toISOString().slice(0, 10),
    };
  },
});
