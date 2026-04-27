import { z } from "zod";

export const IndicatorSpec = z.discriminatedUnion("kind", [
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
  z.object({ kind: z.literal("vwap") }),
  z.object({
    kind: z.literal("fib"),
    lookback: z.number().int().min(10).max(2000).optional(),
  }),
  z.object({
    kind: z.literal("psar"),
    step: z.number().min(0.001).max(0.5),
    max: z.number().min(0.01).max(1),
  }),
  z.object({
    kind: z.literal("maCross"),
    fastPeriod: z.number().int().min(2).max(500),
    slowPeriod: z.number().int().min(2).max(500),
    maType: z.enum(["sma", "ema"]),
  }),
  z.object({
    kind: z.literal("macdCross"),
    fast: z.number().int().min(2).max(200),
    slow: z.number().int().min(2).max(500),
    signal: z.number().int().min(1).max(200),
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
  z.object({
    kind: z.literal("liqSweep"),
    lookback: z.number().int().min(3).max(200),
  }),
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
]);
// Explicit TypeScript union instead of z.infer<>. zod's inference can render
// every property as optional under exactOptionalPropertyTypes on some build
// hosts (Vercel's strict tsc, e.g.), which collapses discriminated-union
// narrowing into `never`. The manual definition is identical to the schema's
// runtime contract — keep them in sync when adding indicators.
export type IndicatorSpec =
  | { kind: "sma"; period: number }
  | { kind: "ema"; period: number }
  | { kind: "rma"; period: number }
  | { kind: "wma"; period: number }
  | { kind: "dema"; period: number }
  | { kind: "rsi"; period: number }
  | { kind: "mom"; period: number }
  | { kind: "roc"; period: number }
  | { kind: "macd"; fast: number; slow: number; signal: number }
  | { kind: "bbands"; period: number; stdDev: number }
  | { kind: "atr"; period: number }
  | { kind: "adx"; period: number }
  | { kind: "stoch"; period: number; signal: number; smooth: number }
  | { kind: "stochRsi"; period: number }
  | { kind: "williamsR"; period: number }
  | { kind: "obv" }
  | { kind: "vwap" }
  | { kind: "fib"; lookback?: number | undefined }
  | { kind: "psar"; step: number; max: number }
  | { kind: "maCross"; fastPeriod: number; slowPeriod: number; maType: "sma" | "ema" }
  | { kind: "macdCross"; fast: number; slow: number; signal: number }
  | { kind: "keltner"; period: number; atrPeriod: number; multiplier: number }
  | { kind: "donchian"; period: number }
  | { kind: "chaikinVol"; emaPeriod: number; rocPeriod: number }
  | { kind: "ad" }
  | { kind: "cmf"; period: number }
  | { kind: "volOsc"; fast: number; slow: number }
  | { kind: "aroon"; period: number }
  | { kind: "vortex"; period: number }
  | { kind: "tii"; majorPeriod: number; minorPeriod: number }
  | { kind: "zscore"; period: number }
  | { kind: "bbPctB"; period: number; stdDev: number }
  | { kind: "hurst"; period: number }
  | { kind: "liqSweep"; lookback: number }
  | { kind: "fvg"; lookback: number; showFilled: boolean }
  | { kind: "srLevels"; lookback: number; strength: number; tolerancePct: number; maxLevels: number }
  | { kind: "pivots"; method: "classic" | "fib" | "camarilla"; timeframe: "weekly" | "monthly" }
  | { kind: "volProfile"; lookback: number; bins: number; valueAreaPct: number; showHistogram: boolean }
  | { kind: "orderBlock"; lookback: number; impulsePct: number; showMitigated: boolean };

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const IndicatorColor = z.union([
  HexColor,
  z.object({
    kind: z.literal("macd"),
    line: HexColor,
    signal: HexColor,
    hist: HexColor,
  }),
  z.object({
    kind: z.literal("stoch"),
    k: HexColor,
    d: HexColor,
  }),
  z.object({
    kind: z.literal("adx"),
    adx: HexColor,
    pdi: HexColor,
    mdi: HexColor,
  }),
  z.object({
    kind: z.literal("maCross"),
    fast: HexColor,
    slow: HexColor,
    bull: HexColor,
    bear: HexColor,
  }),
  z.object({
    kind: z.literal("macdCross"),
    bull: HexColor,
    bear: HexColor,
  }),
  z.object({
    kind: z.literal("keltner"),
    upper: HexColor,
    middle: HexColor,
    lower: HexColor,
  }),
  z.object({
    kind: z.literal("donchian"),
    upper: HexColor,
    middle: HexColor,
    lower: HexColor,
  }),
  z.object({
    kind: z.literal("aroon"),
    up: HexColor,
    down: HexColor,
  }),
  z.object({
    kind: z.literal("vortex"),
    plus: HexColor,
    minus: HexColor,
  }),
  z.object({
    kind: z.literal("liqSweep"),
    highSweep: HexColor,
    lowSweep: HexColor,
  }),
  z.object({
    kind: z.literal("fvg"),
    bullish: HexColor,
    bearish: HexColor,
  }),
  z.object({
    kind: z.literal("srLevels"),
    support: HexColor,
    resistance: HexColor,
  }),
  z.object({
    kind: z.literal("pivots"),
    pp: HexColor,
    resistance: HexColor,
    support: HexColor,
  }),
  z.object({
    kind: z.literal("volProfile"),
    poc: HexColor,
    valueArea: HexColor,
    histogram: HexColor,
  }),
  z.object({
    kind: z.literal("orderBlock"),
    bullish: HexColor,
    bearish: HexColor,
  }),
]);
export type IndicatorColor = z.infer<typeof IndicatorColor>;

export const StoredIndicator = z.object({
  localId: z.string().min(1).max(64),
  spec: IndicatorSpec,
  color: IndicatorColor,
});
export type StoredIndicator = z.infer<typeof StoredIndicator>;

export const RangeSchema = z.enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y", "10y", "max"]);
export type Range = z.infer<typeof RangeSchema>;

export const IntervalSchema = z.enum(["1m", "5m", "15m", "30m", "60m", "90m", "1d", "1wk", "1mo"]);
export type Interval = z.infer<typeof IntervalSchema>;

export const ConvertToSchema = z.enum(["CAD"]).nullable();
export type ConvertTo = z.infer<typeof ConvertToSchema>;

export const SymbolSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z0-9.\-=^]+$/, "Invalid symbol")
  .transform((s) => s.toUpperCase());
