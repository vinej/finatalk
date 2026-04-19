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
]);
export type IndicatorSpec = z.infer<typeof IndicatorSpec>;

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
]);
export type IndicatorColor = z.infer<typeof IndicatorColor>;

export const StoredIndicator = z.object({
  localId: z.string().min(1).max(64),
  spec: IndicatorSpec,
  color: IndicatorColor,
});
export type StoredIndicator = z.infer<typeof StoredIndicator>;

export const RangeSchema = z.enum(["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"]);
export type Range = z.infer<typeof RangeSchema>;

export const IntervalSchema = z.enum(["1d", "1wk", "1mo"]);
export type Interval = z.infer<typeof IntervalSchema>;

export const ConvertToSchema = z.enum(["CAD"]).nullable();
export type ConvertTo = z.infer<typeof ConvertToSchema>;

export const SymbolSchema = z
  .string()
  .trim()
  .min(1)
  .max(20)
  .regex(/^[A-Za-z0-9.\-=^]+$/, "Invalid symbol");
