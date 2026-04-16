import type { RouterInputs } from "@finatalk/trpc";

export type ActiveIndicator =
  RouterInputs["analysis"]["createAnalysis"]["indicators"][number];
export type IndicatorSpec = ActiveIndicator["spec"];
export type IndicatorColor = ActiveIndicator["color"];
export type IndicatorKind = IndicatorSpec["kind"];

export const KINDS: IndicatorKind[] = [
  "sma", "ema", "rma", "wma", "dema",
  "rsi", "mom", "roc", "macd", "bbands",
  "atr", "adx", "stoch", "stochRsi", "williamsR", "obv", "psar",
  "maCross", "macdCross",
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
    case "atr": return "ATR";
    case "adx": return "ADX";
    case "stoch": return "Stoch";
    case "stochRsi": return "StochRSI";
    case "williamsR": return "Williams %R";
    case "obv": return "OBV";
    case "psar": return "PSAR";
    case "maCross": return "MA Cross";
    case "macdCross": return "MACD Cross";
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
    case "atr": return { kind: "atr", period: 14 };
    case "adx": return { kind: "adx", period: 14 };
    case "stoch": return { kind: "stoch", period: 14, signal: 3, smooth: 3 };
    case "stochRsi": return { kind: "stochRsi", period: 14 };
    case "williamsR": return { kind: "williamsR", period: 14 };
    case "obv": return { kind: "obv" };
    case "psar": return { kind: "psar", step: 0.02, max: 0.2 };
    case "maCross": return { kind: "maCross", fastPeriod: 50, slowPeriod: 200, maType: "sma" };
    case "macdCross": return { kind: "macdCross", fast: 12, slow: 26, signal: 9 };
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
    case "atr": return "#f97316";
    case "adx": return { kind: "adx", adx: "#1f2937", pdi: "#16a34a", mdi: "#dc2626" };
    case "stoch": return { kind: "stoch", k: "#2563eb", d: "#dc2626" };
    case "stochRsi": return "#9333ea";
    case "williamsR": return "#0891b2";
    case "obv": return "#64748b";
    case "psar": return "#f43f5e";
    case "maCross":
      return { kind: "maCross", fast: "#2563eb", slow: "#ea580c", bull: "#16a34a", bear: "#dc2626" };
    case "macdCross":
      return { kind: "macdCross", bull: "#16a34a", bear: "#dc2626" };
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
    case "atr":
      return "Average True Range — Wilder's measure of volatility: average of the true range (high-low with gap adjustments) over N periods. Used for stop-loss sizing and position sizing, not direction. Default 14.";
    case "adx":
      return "Average Directional Index — trend strength (0–100) derived from +DI and −DI. ADX > 25 suggests a trending market; +DI above −DI = uptrend, reverse = downtrend. Great filter for moving-average crossovers. Default 14.";
    case "stoch":
      return "Stochastic Oscillator — compares current close to the high/low range over N periods. %K and %D lines bounded 0–100; >80 overbought, <20 oversold. %K/%D crossovers near extremes are the classic signal. Defaults 14/3/3.";
    case "stochRsi":
      return "Stochastic RSI — applies the Stochastic formula to RSI values instead of price. More sensitive than plain RSI, catching shorter overbought/oversold cycles. Range 0–1 (or 0–100). Default 14.";
    case "williamsR":
      return "Williams %R — momentum oscillator on an inverted −100 to 0 scale. Above −20 = overbought, below −80 = oversold. Mechanically similar to Stochastic %K but flipped. Default 14.";
    case "obv":
      return "On-Balance Volume — cumulative volume: adds volume on up days, subtracts on down days. Rising OBV confirms uptrends; divergence with price often precedes reversals. Direction matters more than absolute level.";
    case "psar":
      return "Parabolic SAR — trend-following stop-and-reverse dots that flip from below price (uptrend) to above (downtrend). Used as a trailing stop or trend filter. Defaults step 0.02, max 0.2.";
    case "maCross":
      return "MA Cross — plots a fast and a slow moving average on the price chart and marks every crossover. The classic 50/200 SMA pair produces the 'Golden Cross' (fast crosses above slow — bullish regime) and 'Death Cross' (fast crosses below — bearish). Configurable periods and SMA/EMA.";
    case "macdCross":
      return "MACD Signal Cross — runs MACD and flags every time the MACD line crosses its signal line: up-arrow for bullish, down-arrow for bearish. Use alongside a trend filter to avoid choppy-market whipsaws. Defaults 12/26/9.";
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
    case "atr":
    case "adx":
    case "stochRsi":
    case "williamsR":
      return `${kindLabel(spec.kind)} ${spec.period}`;
    case "macd":
      return `MACD ${spec.fast}/${spec.slow}/${spec.signal}`;
    case "bbands":
      return `BBands ${spec.period}/${spec.stdDev}`;
    case "stoch":
      return `Stoch ${spec.period}/${spec.signal}/${spec.smooth}`;
    case "obv":
      return "OBV";
    case "psar":
      return `PSAR ${spec.step}/${spec.max}`;
    case "maCross": {
      const isGolden = spec.maType === "sma" && spec.fastPeriod === 50 && spec.slowPeriod === 200;
      if (isGolden) return "Golden/Death Cross (SMA 50/200)";
      const base = spec.maType.toUpperCase();
      return `${base} Cross ${spec.fastPeriod}/${spec.slowPeriod}`;
    }
    case "macdCross":
      return `MACD Cross ${spec.fast}/${spec.slow}/${spec.signal}`;
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
