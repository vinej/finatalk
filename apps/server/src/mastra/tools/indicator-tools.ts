import { createTool } from "@mastra/core/tools";
import { runAnalysis } from "@finatalk/trpc/routers/market";
import { z } from "zod";

const MAX_BARS = 60;

const INDICATORS = [
  {
    kind: "sma",
    name: "Simple Moving Average",
    measures: "trend direction / mean price over N bars",
    defaultPeriod: 20,
    bestFor: "smoothing noise, defining trend, support/resistance by crossovers",
  },
  {
    kind: "ema",
    name: "Exponential Moving Average",
    measures: "trend direction with more weight on recent bars",
    defaultPeriod: 20,
    bestFor: "reacting faster than SMA to new price action, short-term trend following",
  },
  {
    kind: "rma",
    name: "Running / Wilder's Moving Average",
    measures: "smoothed average used inside RSI/ATR computations",
    defaultPeriod: 14,
    bestFor: "very smooth trend baseline; less responsive than EMA",
  },
  {
    kind: "wma",
    name: "Weighted Moving Average",
    measures: "trend with linearly increasing weight on recent bars",
    defaultPeriod: 20,
    bestFor: "middle ground between SMA and EMA responsiveness",
  },
  {
    kind: "dema",
    name: "Double Exponential Moving Average",
    measures: "trend with reduced lag vs. EMA",
    defaultPeriod: 20,
    bestFor: "catching trend reversals earlier than EMA, at the cost of noise",
  },
  {
    kind: "rsi",
    name: "Relative Strength Index",
    measures: "momentum / overbought / oversold (0–100 scale)",
    defaultPeriod: 14,
    bestFor: "spotting overbought (>70) and oversold (<30) conditions, divergences",
  },
  {
    kind: "mom",
    name: "Momentum",
    measures: "absolute price change over N bars",
    defaultPeriod: 10,
    bestFor: "raw momentum; zero-line crossovers mark trend shifts",
  },
  {
    kind: "roc",
    name: "Rate of Change",
    measures: "percent price change over N bars",
    defaultPeriod: 12,
    bestFor: "normalized momentum that compares across symbols/timeframes",
  },
  {
    kind: "macd",
    name: "Moving Average Convergence Divergence",
    measures: "difference between two EMAs + signal + histogram",
    defaultPeriod: "fast 12 / slow 26 / signal 9",
    bestFor: "trend changes, signal-line crossovers, momentum divergences",
  },
  {
    kind: "bbands",
    name: "Bollinger Bands",
    measures: "volatility envelope around an SMA (N stddev)",
    defaultPeriod: "20 / 2.0 stddev",
    bestFor: "volatility expansion/contraction, mean-reversion bounces, breakouts",
  },
] as const;

export const listAvailableIndicators = createTool({
  id: "listAvailableIndicators",
  description:
    "Return the catalog of technical indicators the user's chart supports. " +
    "Use this when recommending indicators so you only propose ones that actually exist in the app.",
  inputSchema: z.object({}),
  execute: async () => ({ indicators: INDICATORS }),
});

function round(n: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function roundEntry<T extends Record<string, unknown>>(p: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    out[k] = typeof v === "number" && k !== "time" ? round(v) : v;
  }
  return out as T;
}

export const analyzeSymbol = createTool({
  id: "analyzeSymbol",
  description:
    "Fetch live OHLC data and compute one or more indicators for a given ticker. " +
    "Use this whenever you need current market numbers to ground a recommendation — " +
    "do NOT guess prices, trends, or indicator values.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, GIB, MSFT"),
    range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]).default("6mo"),
    interval: z.enum(["1d", "1wk", "1mo"]).default("1d"),
    indicators: z.array(z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("sma"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("ema"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("rma"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("wma"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("dema"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("rsi"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("mom"), period: z.number().int().min(1).max(500) }),
      z.object({ kind: z.literal("roc"), period: z.number().int().min(1).max(500) }),
      z.object({
        kind: z.literal("macd"),
        fast: z.number().int().min(2).max(200),
        slow: z.number().int().min(2).max(500),
        signal: z.number().int().min(1).max(200),
      }),
      z.object({
        kind: z.literal("bbands"),
        period: z.number().int().min(2).max(500),
        stdDev: z.number().min(0.1).max(10),
      }),
    ])).default([]),
  }),
  execute: async ({ symbol, range, interval, indicators }) => {
    const analysis = await runAnalysis({
      symbol,
      range: range ?? "6mo",
      interval: interval ?? "1d",
      indicators: indicators ?? [],
    });
    const recent = analysis.candles.slice(-MAX_BARS).map((c) => ({
      t: new Date(c.time * 1000).toISOString().slice(0, 10),
      o: round(c.open),
      h: round(c.high),
      l: round(c.low),
      c: round(c.close),
      v: c.volume,
    }));
    const indicatorResults = analysis.results.map((r) => {
      const last = r.series[r.series.length - 1];
      const tail = r.series.slice(-5).map((p) => roundEntry(p));
      return { kind: r.kind, spec: r.spec, last: last ? roundEntry(last) : null, tail };
    });
    const first = recent[0];
    const latest = recent[recent.length - 1];
    return {
      symbol: analysis.symbol,
      nativeCurrency: analysis.nativeCurrency,
      barCount: analysis.candles.length,
      windowFirstDate: first?.t ?? null,
      windowLastDate: latest?.t ?? null,
      latestClose: latest?.c ?? null,
      windowLow: recent.length > 0 ? round(Math.min(...recent.map((b) => b.l))) : null,
      windowHigh: recent.length > 0 ? round(Math.max(...recent.map((b) => b.h))) : null,
      bars: recent,
      indicators: indicatorResults,
    };
  },
});
