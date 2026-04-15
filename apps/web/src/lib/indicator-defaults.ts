import type { RouterInputs } from "@finatalk/trpc";

export type ActiveIndicator =
  RouterInputs["analysis"]["createAnalysis"]["indicators"][number];
export type IndicatorSpec = ActiveIndicator["spec"];
export type IndicatorColor = ActiveIndicator["color"];
export type IndicatorKind = IndicatorSpec["kind"];

export const KINDS: IndicatorKind[] = [
  "sma", "ema", "rma", "wma", "dema", "rsi", "mom", "roc", "macd", "bbands",
];

export function kindLabel(kind: IndicatorKind): string {
  switch (kind) {
    case "sma": return "SMA";
    case "ema": return "EMA";
    case "rma": return "RMA";
    case "wma": return "WMA";
    case "dema": return "DEMA";
    case "rsi": return "RSI";
    case "mom": return "MOM";
    case "roc": return "ROC";
    case "macd": return "MACD";
    case "bbands": return "BBands";
  }
}

export function defaultSpec(kind: IndicatorKind): IndicatorSpec {
  switch (kind) {
    case "sma": return { kind: "sma", period: 20 };
    case "ema": return { kind: "ema", period: 50 };
    case "rma": return { kind: "rma", period: 14 };
    case "wma": return { kind: "wma", period: 20 };
    case "dema": return { kind: "dema", period: 20 };
    case "rsi": return { kind: "rsi", period: 14 };
    case "mom": return { kind: "mom", period: 10 };
    case "roc": return { kind: "roc", period: 12 };
    case "macd": return { kind: "macd", fast: 12, slow: 26, signal: 9 };
    case "bbands": return { kind: "bbands", period: 20, stdDev: 2 };
  }
}

export function defaultColor(kind: IndicatorKind): IndicatorColor {
  switch (kind) {
    case "sma": return "#2563eb";
    case "ema": return "#16a34a";
    case "rma": return "#0ea5e9";
    case "wma": return "#f59e0b";
    case "dema": return "#14b8a6";
    case "rsi": return "#7c3aed";
    case "mom": return "#ef4444";
    case "roc": return "#a855f7";
    case "macd": return { kind: "macd", line: "#2563eb", signal: "#dc2626", hist: "#9ca3af" };
    case "bbands": return "#db2777";
  }
}

export function kindDescription(kind: IndicatorKind): string {
  switch (kind) {
    case "sma":
      return "Simple Moving Average — equal-weighted average of the last N closes. Smooths price to reveal trend direction; price crossing above/below the SMA is a common trend signal. Typical periods: 20 (short), 50 (medium), 200 (long).";
    case "ema":
      return "Exponential Moving Average — weighted average that reacts faster to recent prices than the SMA. Often used in trend-following crossovers (e.g. EMA 12 vs EMA 26) and as dynamic support/resistance.";
    case "rma":
      return "Running (Wilder's) Moving Average — exponential smoothing with a slower decay (alpha = 1/N). The smoothing used inside RSI and ATR; smoother than EMA, less reactive to spikes.";
    case "wma":
      return "Weighted Moving Average — linear weights so the most recent close counts most. Reacts faster than SMA while staying smoother than EMA. Useful for short-term trend detection.";
    case "dema":
      return "Double Exponential Moving Average — two-stage EMA designed to reduce lag. Hugs price more tightly than EMA, useful for catching trend changes earlier (at the cost of more noise).";
    case "rsi":
      return "Relative Strength Index — momentum oscillator bounded 0–100, comparing average gains to average losses over N periods. Above 70 = overbought, below 30 = oversold; divergence with price often signals reversals. Default 14.";
    case "mom":
      return "Momentum — close minus close N periods ago. Positive = price rising vs N bars ago, negative = falling. Zero-line crossings flag shifts in directional strength.";
    case "roc":
      return "Rate of Change — percent change vs close N periods ago. Like Momentum but normalized, so it's comparable across price levels. Used to spot acceleration, divergence, and overbought/oversold extremes.";
    case "macd":
      return "Moving Average Convergence Divergence — MACD line = EMA(fast) − EMA(slow), Signal = EMA of MACD, Histogram = MACD − Signal. Signal-line crossovers, zero-line crossings, and histogram divergences are the classic trade triggers. Defaults 12/26/9.";
    case "bbands":
      return "Bollinger Bands — middle SMA(N) with upper/lower bands at K standard deviations. Bands widen on volatility, narrow on calm (the 'squeeze' precedes breakouts); touches near the bands flag overextension. Defaults period 20, stdDev 2.";
  }
}

export function formatLabel(spec: IndicatorSpec): string {
  switch (spec.kind) {
    case "sma":
    case "ema":
    case "rma":
    case "wma":
    case "dema":
    case "rsi":
    case "mom":
    case "roc":
      return `${kindLabel(spec.kind)} ${spec.period}`;
    case "macd":
      return `MACD ${spec.fast}/${spec.slow}/${spec.signal}`;
    case "bbands":
      return `BBands ${spec.period}/${spec.stdDev}`;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createActive(kind: IndicatorKind): ActiveIndicator {
  return { localId: newId(), spec: defaultSpec(kind), color: defaultColor(kind) };
}

export const DEFAULT_SEED: ActiveIndicator[] = [
  createActive("sma"),
  createActive("rsi"),
  createActive("macd"),
];
