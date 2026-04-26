import { createTool } from "@mastra/core/tools";
import { indicatorTail, runAnalysis } from "@finatalk/trpc/routers/market";
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
  {
    kind: "atr",
    name: "Average True Range",
    measures: "volatility — average true range (Wilder) over N periods",
    defaultPeriod: 14,
    bestFor: "position sizing and stop-loss placement; not a directional signal",
  },
  {
    kind: "adx",
    name: "Average Directional Index",
    measures: "trend strength 0–100 with +DI/−DI direction components",
    defaultPeriod: 14,
    bestFor: "filtering moving-average crossovers: ADX > 25 = trend worth trading",
  },
  {
    kind: "stoch",
    name: "Stochastic Oscillator",
    measures: "close vs. high/low range (%K / %D) on a 0–100 scale",
    defaultPeriod: "14 / 3 / 3",
    bestFor: "overbought (>80) / oversold (<20) reversals, %K/%D crossovers",
  },
  {
    kind: "stochRsi",
    name: "Stochastic RSI",
    measures: "Stochastic applied to RSI — 0–1 range, more sensitive than RSI",
    defaultPeriod: 14,
    bestFor: "catching shorter overbought/oversold cycles than plain RSI",
  },
  {
    kind: "williamsR",
    name: "Williams %R",
    measures: "momentum oscillator on an inverted −100 to 0 scale",
    defaultPeriod: 14,
    bestFor: "overbought (>−20) / oversold (<−80); similar to Stochastic %K, flipped",
  },
  {
    kind: "obv",
    name: "On-Balance Volume",
    measures: "cumulative volume: +volume on up days, −volume on down days",
    defaultPeriod: "n/a",
    bestFor: "volume-based trend confirmation and divergence with price",
  },
  {
    kind: "psar",
    name: "Parabolic SAR",
    measures: "trailing stop dots that flip below/above price by trend",
    defaultPeriod: "step 0.02 / max 0.2",
    bestFor: "trailing stops and trend-direction filter in trending markets",
  },
  {
    kind: "keltner",
    name: "Keltner Channels",
    measures: "EMA envelope with upper/lower bands at multiplier × ATR",
    defaultPeriod: "EMA 20 / ATR 20 / multiplier 2",
    bestFor: "smoother alternative to Bollinger for trend breakouts and trailing stops",
  },
  {
    kind: "donchian",
    name: "Donchian Channels",
    measures: "highest high / lowest low over N bars + midline",
    defaultPeriod: 20,
    bestFor: "classic Turtle breakout entries and N-bar support/resistance",
  },
  {
    kind: "chaikinVol",
    name: "Chaikin Volatility",
    measures: "rate of change of EMA(high − low), in percent",
    defaultPeriod: "EMA 10 / ROC 10",
    bestFor: "detecting volatility regime shifts (expansion vs. contraction)",
  },
  {
    kind: "ad",
    name: "Accumulation/Distribution",
    measures: "cumulative close-location-weighted money flow (CLV × volume)",
    defaultPeriod: "n/a",
    bestFor: "volume-confirmed trend and divergences, refined over OBV",
  },
  {
    kind: "cmf",
    name: "Chaikin Money Flow",
    measures: "rolling sum(MFV) / sum(volume) over N bars, oscillating around 0",
    defaultPeriod: 20,
    bestFor: "buying vs. selling pressure over a window; sustained sign reads bias",
  },
  {
    kind: "volOsc",
    name: "Volume Oscillator",
    measures: "percent difference between fast and slow SMAs of volume",
    defaultPeriod: "fast 5 / slow 20",
    bestFor: "confirming breakouts with expanding volume, filtering low-conviction moves",
  },
  {
    kind: "aroon",
    name: "Aroon Indicator",
    measures: "two 0–100 lines tracking bars since N-period high (Up) and low (Down)",
    defaultPeriod: 25,
    bestFor: "detecting start of new trends and gauging trend strength/direction in one read",
  },
  {
    kind: "vortex",
    name: "Vortex Indicator",
    measures: "VI+ and VI− lines from directional movement vs. true range",
    defaultPeriod: 14,
    bestFor: "crossover-based trend signals; widening spread = strong trend",
  },
  {
    kind: "tii",
    name: "Trend Intensity Index",
    measures: "proportion of positive deviations from a long-term SMA, 0–100",
    defaultPeriod: "major 60 / minor 30",
    bestFor: "quantifying trending vs. choppy conditions; >80 trending up, <20 trending down",
  },
  {
    kind: "zscore",
    name: "Price Z-Score",
    measures: "standardised distance of close from its rolling SMA, expressed in σ",
    defaultPeriod: 20,
    bestFor: "statistical mean-reversion fades: |Z| > 2 is stretched, |Z| > 3 extreme",
  },
  {
    kind: "bbPctB",
    name: "Bollinger %B",
    measures: "position of close within the Bollinger Bands, rescaled 0–1",
    defaultPeriod: "period 20 / stdDev 2",
    bestFor: "normalised Bollinger reading; divergences and >1 / <0 overextension flags",
  },
  {
    kind: "hurst",
    name: "Hurst Exponent",
    measures: "long-memory exponent from R/S analysis over dyadic scales (advanced)",
    defaultPeriod: 100,
    bestFor: "regime filter — H > 0.5 trending (momentum), < 0.5 mean-reverting, ≈ 0.5 random",
  },
  {
    kind: "liqSweep",
    name: "Liquidity Sweep",
    measures: "bars that pierce the prior N-bar high/low but close back inside the range",
    defaultPeriod: "lookback 10",
    bestFor: "flagging stop-hunts/fake-outs at range extremes; often precede mean-reversion moves",
  },
  {
    kind: "fvg",
    name: "Fair Value Gap",
    measures: "3-bar price imbalances (gap between bar[-2] and bar[0] wicks)",
    defaultPeriod: "lookback 200, showFilled off",
    bestFor: "identifying unfilled imbalance zones that often act as magnet/reaction levels",
  },
  {
    kind: "srLevels",
    name: "Support / Resistance (auto)",
    measures: "horizontal levels clustered from fractal swing pivots, ranked by touches × recency",
    defaultPeriod: "lookback 500, strength 3, tol 0.5%, maxLevels 8",
    bestFor: "objective S/R zones for stop placement and reaction entries, especially in range regimes",
  },
  {
    kind: "pivots",
    name: "Pivot Points",
    measures: "classical / Fibonacci / Camarilla levels from the prior period's H/L/C",
    defaultPeriod: "classic, weekly",
    bestFor: "static intraday / weekly reference levels; PP bias + R1/S1 reaction; R2/S2 targets",
  },
  {
    kind: "volProfile",
    name: "Volume Profile",
    measures: "price-binned volume distribution over the lookback window with POC + value area",
    defaultPeriod: "lookback 200, bins 40, value area 70%",
    bestFor: "structural price acceptance map; POC acts as magnet, VAH/VAL as support/resistance",
  },
  {
    kind: "orderBlock",
    name: "Order Blocks",
    measures: "last opposite-colour candle before an impulse move ≥ threshold (SMC / ICT concept)",
    defaultPeriod: "lookback 200, impulse 1.5%",
    bestFor: "premium/discount retest zones on pullbacks; strong when paired with HTF bias + sweeps",
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
    // .optional() (rather than .default()) so these fields are emitted as NOT
    // required in the JSON Schema shipped to the LLM. Llama-family models via
    // Groq omit them ~30% of the time; Groq's server-side validator rejects
    // the tool call if any `required` field is missing. Defaults applied in
    // execute below.
    range: z.enum(["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y", "10y", "max"]).optional(),
    interval: z.enum(["1d", "1wk", "1mo"]).optional(),
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
      z.object({ kind: z.literal("atr"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("adx"), period: z.number().int().min(2).max(500) }),
      z.object({
        kind: z.literal("stoch"),
        period: z.number().int().min(2).max(500),
        signal: z.number().int().min(1).max(200),
        smooth: z.number().int().min(1).max(200),
      }),
      z.object({ kind: z.literal("stochRsi"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("williamsR"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("obv") }),
      z.object({
        kind: z.literal("psar"),
        step: z.number().min(0.001).max(0.5),
        max: z.number().min(0.01).max(1),
      }),
      z.object({
        kind: z.literal("keltner"),
        period: z.number().int().min(2).max(500),
        atrPeriod: z.number().int().min(2).max(500),
        multiplier: z.number().min(0.1).max(10),
      }),
      z.object({
        kind: z.literal("donchian"),
        period: z.number().int().min(2).max(500),
      }),
      z.object({
        kind: z.literal("chaikinVol"),
        emaPeriod: z.number().int().min(2).max(500),
        rocPeriod: z.number().int().min(1).max(500),
      }),
      z.object({ kind: z.literal("ad") }),
      z.object({ kind: z.literal("cmf"), period: z.number().int().min(2).max(500) }),
      z.object({
        kind: z.literal("volOsc"),
        fast: z.number().int().min(2).max(500),
        slow: z.number().int().min(2).max(500),
      }),
      z.object({ kind: z.literal("aroon"), period: z.number().int().min(2).max(500) }),
      z.object({ kind: z.literal("vortex"), period: z.number().int().min(2).max(500) }),
      z.object({
        kind: z.literal("tii"),
        majorPeriod: z.number().int().min(2).max(500),
        minorPeriod: z.number().int().min(1).max(500),
      }),
      z.object({ kind: z.literal("zscore"), period: z.number().int().min(2).max(500) }),
      z.object({
        kind: z.literal("bbPctB"),
        period: z.number().int().min(2).max(500),
        stdDev: z.number().min(0.1).max(10),
      }),
      z.object({ kind: z.literal("hurst"), period: z.number().int().min(20).max(2000) }),
      z.object({ kind: z.literal("liqSweep"), lookback: z.number().int().min(3).max(200) }),
      z.object({
        kind: z.literal("fvg"),
        lookback: z.number().int().min(10).max(2000),
        showFilled: z.boolean(),
      }),
      z.object({
        kind: z.literal("srLevels"),
        lookback: z.number().int().min(30).max(5000),
        strength: z.number().int().min(1).max(20),
        tolerancePct: z.number().min(0.05).max(5),
        maxLevels: z.number().int().min(2).max(30),
      }),
      z.object({
        kind: z.literal("pivots"),
        method: z.enum(["classic", "fib", "camarilla"]),
        timeframe: z.enum(["weekly", "monthly"]),
      }),
      z.object({
        kind: z.literal("volProfile"),
        lookback: z.number().int().min(20).max(5000),
        bins: z.number().int().min(10).max(200),
        valueAreaPct: z.number().min(0.5).max(0.95),
        showHistogram: z.boolean(),
      }),
      z.object({
        kind: z.literal("orderBlock"),
        lookback: z.number().int().min(20).max(2000),
        impulsePct: z.number().min(0.5).max(20),
        showMitigated: z.boolean(),
      }),
    ])).optional(),
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
      const { last, tail, events } = indicatorTail(r);
      return {
        kind: r.kind,
        spec: r.spec,
        last: last ? roundEntry(last) : null,
        tail: tail.map((p) => roundEntry(p)),
        ...(events ? { events: events.slice(-5) } : {}),
      };
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
