import type { RouterInputs } from "@finatalk/trpc";
import type { Lang } from "@/lib/lang";

export type ActiveIndicator =
  RouterInputs["analysis"]["createAnalysis"]["indicators"][number];
export type IndicatorSpec = ActiveIndicator["spec"];
export type IndicatorColor = ActiveIndicator["color"];
export type IndicatorKind = IndicatorSpec["kind"];

export const KINDS: IndicatorKind[] = [
  "sma", "ema", "rma", "wma", "dema", "vwap",
  "rsi", "mom", "roc", "macd", "bbands",
  "atr", "adx", "stoch", "stochRsi", "williamsR", "obv", "psar",
  "maCross", "macdCross", "fib",
  "keltner", "donchian", "chaikinVol",
  "ad", "cmf", "volOsc",
  "aroon", "vortex", "tii",
  "zscore", "bbPctB", "hurst",
  "liqSweep", "fvg",
  "srLevels", "pivots", "volProfile", "orderBlock",
];

// Finatalk's "core" indicator set — surfaced with primary-color treatment in
// Learn TA and the Analysis indicator picker so users learn which to reach for
// first. Kept tight: 8 indicators that cover the four families well.
export const CORE_KINDS: ReadonlySet<IndicatorKind> = new Set<IndicatorKind>([
  "ema", "rsi", "macd", "bbands", "atr", "adx", "obv", "vwap",
]);

export function isCoreKind(kind: IndicatorKind): boolean {
  return CORE_KINDS.has(kind);
}

export type IndicatorCategory = "trend" | "momentum" | "volatility" | "volume" | "hybrid";

export const CATEGORIES: IndicatorCategory[] = [
  "trend", "momentum", "volatility", "volume", "hybrid",
];

const KIND_CATEGORY: Record<IndicatorKind, IndicatorCategory> = {
  sma: "trend",
  ema: "trend",
  rma: "trend",
  wma: "trend",
  dema: "trend",
  psar: "trend",
  maCross: "trend",
  rsi: "momentum",
  mom: "momentum",
  roc: "momentum",
  stoch: "momentum",
  stochRsi: "momentum",
  williamsR: "momentum",
  atr: "volatility",
  bbands: "volatility",
  keltner: "volatility",
  donchian: "volatility",
  chaikinVol: "volatility",
  obv: "volume",
  vwap: "volume",
  ad: "volume",
  cmf: "volume",
  volOsc: "volume",
  macd: "hybrid",
  macdCross: "hybrid",
  adx: "hybrid",
  fib: "hybrid",
  aroon: "trend",
  vortex: "trend",
  tii: "trend",
  zscore: "momentum",
  bbPctB: "volatility",
  hurst: "hybrid",
  liqSweep: "hybrid",
  fvg: "hybrid",
  srLevels: "hybrid",
  pivots: "hybrid",
  volProfile: "volume",
  orderBlock: "hybrid",
};

export function kindCategory(kind: IndicatorKind): IndicatorCategory {
  return KIND_CATEGORY[kind];
}

const CATEGORY_LABEL_EN: Record<IndicatorCategory, string> = {
  trend: "Trend",
  momentum: "Momentum",
  volatility: "Volatility",
  volume: "Volume",
  hybrid: "Hybrid",
};

const CATEGORY_LABEL_FR: Record<IndicatorCategory, string> = {
  trend: "Tendance",
  momentum: "Momentum",
  volatility: "Volatilité",
  volume: "Volume",
  hybrid: "Hybride",
};

export function categoryLabel(cat: IndicatorCategory, lang: Lang = "en"): string {
  return (lang === "fr" ? CATEGORY_LABEL_FR : CATEGORY_LABEL_EN)[cat];
}

export function kindLabel(kind: IndicatorKind): string {
  switch (kind) {
    case "sma": return "SMA";
    case "ema": return "EMA";
    case "rma": return "RMA";
    case "wma": return "WMA";
    case "dema": return "DEMA";
    case "vwap": return "VWAP";
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
    case "fib": return "Fib";
    case "keltner": return "Keltner";
    case "donchian": return "Donchian";
    case "chaikinVol": return "Chaikin Vol";
    case "ad": return "A/D";
    case "cmf": return "CMF";
    case "volOsc": return "Vol Osc";
    case "aroon": return "Aroon";
    case "vortex": return "Vortex";
    case "tii": return "TII";
    case "zscore": return "Z-Score";
    case "bbPctB": return "BB %B";
    case "hurst": return "Hurst";
    case "liqSweep": return "Liq Sweep";
    case "fvg": return "FVG";
    case "srLevels": return "S/R";
    case "pivots": return "Pivots";
    case "volProfile": return "Vol Profile";
    case "orderBlock": return "Order Block";
  }
}

const FULL_NAME_EN: Record<IndicatorKind, string> = {
  sma: "Simple Moving Average",
  ema: "Exponential Moving Average",
  rma: "Running Moving Average",
  wma: "Weighted Moving Average",
  dema: "Double Exponential Moving Average",
  vwap: "Volume-Weighted Average Price",
  rsi: "Relative Strength Index",
  mom: "Momentum",
  roc: "Rate of Change",
  macd: "Moving Average Convergence Divergence",
  bbands: "Bollinger Bands",
  atr: "Average True Range",
  adx: "Average Directional Index",
  stoch: "Stochastic Oscillator",
  stochRsi: "Stochastic RSI",
  williamsR: "Williams Percent Range",
  obv: "On-Balance Volume",
  psar: "Parabolic Stop and Reverse",
  maCross: "Moving Average Crossover",
  macdCross: "MACD Signal Crossover",
  fib: "Fibonacci Retracement",
  keltner: "Keltner Channels",
  donchian: "Donchian Channels",
  chaikinVol: "Chaikin Volatility",
  ad: "Accumulation/Distribution Line",
  cmf: "Chaikin Money Flow",
  volOsc: "Volume Oscillator",
  aroon: "Aroon Indicator",
  vortex: "Vortex Indicator",
  tii: "Trend Intensity Index",
  zscore: "Price Z-Score",
  bbPctB: "Bollinger %B",
  hurst: "Hurst Exponent",
  liqSweep: "Liquidity Sweep",
  fvg: "Fair Value Gap",
  srLevels: "Support/Resistance Levels",
  pivots: "Pivot Points",
  volProfile: "Volume Profile",
  orderBlock: "Order Block",
};

const FULL_NAME_FR: Record<IndicatorKind, string> = {
  sma: "Moyenne mobile simple",
  ema: "Moyenne mobile exponentielle",
  rma: "Moyenne mobile de Wilder",
  wma: "Moyenne mobile pondérée",
  dema: "Double moyenne mobile exponentielle",
  vwap: "Cours moyen pondéré par le volume",
  rsi: "Indice de force relative",
  mom: "Momentum",
  roc: "Taux de variation",
  macd: "Convergence-divergence de moyennes mobiles",
  bbands: "Bandes de Bollinger",
  atr: "Écart moyen réel",
  adx: "Indice directionnel moyen",
  stoch: "Oscillateur stochastique",
  stochRsi: "Stochastique RSI",
  williamsR: "Williams %R",
  obv: "Volume d'équilibre",
  psar: "SAR parabolique",
  maCross: "Croisement de moyennes mobiles",
  macdCross: "Croisement du signal MACD",
  fib: "Retracement de Fibonacci",
  keltner: "Canaux de Keltner",
  donchian: "Canaux de Donchian",
  chaikinVol: "Volatilité de Chaikin",
  ad: "Ligne d'accumulation/distribution",
  cmf: "Chaikin Money Flow",
  volOsc: "Oscillateur de volume",
  aroon: "Indicateur Aroon",
  vortex: "Indicateur Vortex",
  tii: "Indice d'intensité de tendance",
  zscore: "Score Z du prix",
  bbPctB: "Bollinger %B",
  hurst: "Exposant de Hurst",
  liqSweep: "Sweep de liquidité",
  fvg: "Fair Value Gap",
  srLevels: "Niveaux de support/résistance",
  pivots: "Points pivots",
  volProfile: "Profil de volume",
  orderBlock: "Order Block",
};

export function kindFullName(kind: IndicatorKind, lang: Lang = "en"): string {
  if (lang === "fr") {
    return `${FULL_NAME_EN[kind]}, ${FULL_NAME_FR[kind]}`;
  }
  return FULL_NAME_EN[kind];
}

export function defaultSpec(kind: IndicatorKind): IndicatorSpec {
  switch (kind) {
    case "sma": return { kind: "sma", period: 20 };
    case "ema": return { kind: "ema", period: 50 };
    case "rma": return { kind: "rma", period: 14 };
    case "wma": return { kind: "wma", period: 20 };
    case "dema": return { kind: "dema", period: 20 };
    case "vwap": return { kind: "vwap" };
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
    case "fib": return { kind: "fib" };
    case "keltner": return { kind: "keltner", period: 20, atrPeriod: 20, multiplier: 2 };
    case "donchian": return { kind: "donchian", period: 20 };
    case "chaikinVol": return { kind: "chaikinVol", emaPeriod: 10, rocPeriod: 10 };
    case "ad": return { kind: "ad" };
    case "cmf": return { kind: "cmf", period: 20 };
    case "volOsc": return { kind: "volOsc", fast: 5, slow: 20 };
    case "aroon": return { kind: "aroon", period: 25 };
    case "vortex": return { kind: "vortex", period: 14 };
    case "tii": return { kind: "tii", majorPeriod: 60, minorPeriod: 30 };
    case "zscore": return { kind: "zscore", period: 20 };
    case "bbPctB": return { kind: "bbPctB", period: 20, stdDev: 2 };
    case "hurst": return { kind: "hurst", period: 100 };
    case "liqSweep": return { kind: "liqSweep", lookback: 10 };
    case "fvg": return { kind: "fvg", lookback: 200, showFilled: false };
    case "srLevels":
      return { kind: "srLevels", lookback: 500, strength: 3, tolerancePct: 0.5, maxLevels: 8 };
    case "pivots":
      return { kind: "pivots", method: "classic", timeframe: "weekly" };
    case "volProfile":
      return { kind: "volProfile", lookback: 200, bins: 40, valueAreaPct: 0.7, showHistogram: false };
    case "orderBlock":
      return { kind: "orderBlock", lookback: 200, impulsePct: 1.5, showMitigated: false };
  }
}

export function defaultColor(kind: IndicatorKind): IndicatorColor {
  switch (kind) {
    case "sma": return "#2563eb";
    case "ema": return "#16a34a";
    case "rma": return "#0ea5e9";
    case "wma": return "#f59e0b";
    case "dema": return "#14b8a6";
    case "vwap": return "#8b5cf6";
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
    case "fib": return "#c026d3";
    case "keltner":
      return { kind: "keltner", upper: "#0ea5e9", middle: "#0369a1", lower: "#0ea5e9" };
    case "donchian":
      return { kind: "donchian", upper: "#a855f7", middle: "#6b21a8", lower: "#a855f7" };
    case "chaikinVol": return "#f59e0b";
    case "ad": return "#0d9488";
    case "cmf": return "#059669";
    case "volOsc": return "#eab308";
    case "aroon": return { kind: "aroon", up: "#16a34a", down: "#dc2626" };
    case "vortex": return { kind: "vortex", plus: "#2563eb", minus: "#ea580c" };
    case "tii": return "#8b5cf6";
    case "zscore": return "#d946ef";
    case "bbPctB": return "#db2777";
    case "hurst": return "#0f766e";
    case "liqSweep": return { kind: "liqSweep", highSweep: "#dc2626", lowSweep: "#16a34a" };
    case "fvg": return { kind: "fvg", bullish: "#16a34a", bearish: "#dc2626" };
    case "srLevels":
      return { kind: "srLevels", support: "#16a34a", resistance: "#dc2626" };
    case "pivots":
      return { kind: "pivots", pp: "#6366f1", resistance: "#dc2626", support: "#16a34a" };
    case "volProfile":
      return { kind: "volProfile", poc: "#f59e0b", valueArea: "#60a5fa", histogram: "#94a3b8" };
    case "orderBlock":
      return { kind: "orderBlock", bullish: "#16a34a", bearish: "#dc2626" };
  }
}

const KIND_DESCRIPTIONS_EN: Record<IndicatorKind, string> = {
  sma: "Simple Moving Average — equal-weighted average of the last N closes. Smooths price to reveal trend direction; price crossing above/below the SMA is a common trend signal. Typical periods: 20 (short), 50 (medium), 200 (long).",
  ema: "Exponential Moving Average — weighted average that reacts faster to recent prices than the SMA. Often used in trend-following crossovers (e.g. EMA 12 vs EMA 26) and as dynamic support/resistance.",
  rma: "Running (Wilder's) Moving Average — exponential smoothing with a slower decay (alpha = 1/N). The smoothing used inside RSI and ATR; smoother than EMA, less reactive to spikes.",
  wma: "Weighted Moving Average — linear weights so the most recent close counts most. Reacts faster than SMA while staying smoother than EMA. Useful for short-term trend detection.",
  dema: "Double Exponential Moving Average — two-stage EMA designed to reduce lag. Hugs price more tightly than EMA, useful for catching trend changes earlier (at the cost of more noise).",
  vwap: "Volume-Weighted Average Price — cumulative sum of (typical price × volume) divided by cumulative volume, where typical price = (high + low + close) / 3. Heavily used by institutional traders and algo execution as the 'fair price' benchmark. Price above VWAP = bullish bias, below = bearish; popular in intraday and day trading. No period parameter — runs from the first candle.",
  rsi: "Relative Strength Index — momentum oscillator bounded 0–100, comparing average gains to average losses over N periods. Above 70 = overbought, below 30 = oversold; divergence with price often signals reversals. Default 14.",
  mom: "Momentum — close minus close N periods ago. Positive = price rising vs N bars ago, negative = falling. Zero-line crossings flag shifts in directional strength.",
  roc: "Rate of Change — percent change vs close N periods ago. Like Momentum but normalized, so it's comparable across price levels. Used to spot acceleration, divergence, and overbought/oversold extremes.",
  macd: "Moving Average Convergence Divergence — MACD line = EMA(fast) − EMA(slow), Signal = EMA of MACD, Histogram = MACD − Signal. Signal-line crossovers, zero-line crossings, and histogram divergences are the classic trade triggers. Defaults 12/26/9.",
  bbands: "Bollinger Bands — middle SMA(N) with upper/lower bands at K standard deviations. Bands widen on volatility, narrow on calm (the 'squeeze' precedes breakouts); touches near the bands flag overextension. Defaults period 20, stdDev 2.",
  atr: "Average True Range — Wilder's measure of volatility: average of the true range (high-low with gap adjustments) over N periods. Used for stop-loss sizing and position sizing, not direction. Default 14.",
  adx: "Average Directional Index — trend strength (0–100) derived from +DI and −DI. ADX > 25 suggests a trending market; +DI above −DI = uptrend, reverse = downtrend. Great filter for moving-average crossovers. Default 14.",
  stoch: "Stochastic Oscillator — compares current close to the high/low range over N periods. %K and %D lines bounded 0–100; >80 overbought, <20 oversold. %K/%D crossovers near extremes are the classic signal. Defaults 14/3/3.",
  stochRsi: "Stochastic RSI — applies the Stochastic formula to RSI values instead of price. More sensitive than plain RSI, catching shorter overbought/oversold cycles. Range 0–1 (or 0–100). Default 14.",
  williamsR: "Williams %R — momentum oscillator on an inverted −100 to 0 scale. Above −20 = overbought, below −80 = oversold. Mechanically similar to Stochastic %K but flipped. Default 14.",
  obv: "On-Balance Volume — cumulative volume: adds volume on up days, subtracts on down days. Rising OBV confirms uptrends; divergence with price often precedes reversals. Direction matters more than absolute level.",
  psar: "Parabolic SAR — trend-following stop-and-reverse dots that flip from below price (uptrend) to above (downtrend). Used as a trailing stop or trend filter. Defaults step 0.02, max 0.2.",
  maCross: "MA Cross — plots a fast and a slow moving average on the price chart and marks every crossover. The classic 50/200 SMA pair produces the 'Golden Cross' (fast crosses above slow — bullish regime) and 'Death Cross' (fast crosses below — bearish). Configurable periods and SMA/EMA.",
  macdCross: "MACD Signal Cross — runs MACD and flags every time the MACD line crosses its signal line: up-arrow for bullish, down-arrow for bearish. Use alongside a trend filter to avoid choppy-market whipsaws. Defaults 12/26/9.",
  fib: "Fibonacci Retracement — draws horizontal levels (23.6%, 38.2%, 50%, 61.8%, 78.6%) between the highest high and lowest low of the loaded range (or the last N candles if a lookback is set). Direction (uptrend vs downtrend retracement) is auto-detected from which swing came last. Popular with discretionary traders as potential pullback/support zones; the 38.2%, 50%, and 61.8% levels are the most watched. Effectiveness relies partly on self-fulfilling prophecy — expect reactions, not guarantees.",
  keltner: "Keltner Channels — volatility-based envelope around an EMA(period) with upper/lower bands at ATR(atrPeriod) × multiplier. Unlike Bollinger Bands (which use standard deviation), Keltner uses true range, so bands are smoother and less prone to rapid whipsaws. Price riding the upper band signals strong uptrend; breakouts outside the channel often mark trend initiations. Defaults period 20, ATR 20, multiplier 2.",
  donchian: "Donchian Channels — upper band = highest high over N bars, lower band = lowest low over N bars, middle = their average. The original turtle-trading breakout signal: enter long on a close above the upper band, exit on a break of the lower. Also doubles as a trailing-stop tool and support/resistance finder. Default period 20 (classic 'Turtle' breakout).",
  chaikinVol: "Chaikin Volatility — measures the rate of change of an EMA(emaPeriod) of (high − low) over the last rocPeriod bars, expressed as a percentage. Rising values mean volatility is expanding (often around breakouts or panic moves); falling values signal contracting ranges (consolidation). Unlike ATR, which tracks absolute range, Chaikin Vol tracks the relative change — useful for spotting volatility regime shifts. Defaults 10/10.",
  ad: "Accumulation/Distribution — cumulative volume weighted by where the close falls within each bar's range: near the high adds, near the low subtracts. Similar in spirit to OBV but more nuanced, because partial bars contribute partially. Rising A/D with rising price confirms the trend; divergence (price up, A/D flat/falling) often precedes reversals.",
  cmf: "Chaikin Money Flow — sum of Money Flow Volume over N bars divided by sum of volume over the same window. Bounded roughly −1 to +1. Positive readings indicate buying pressure (closes concentrated near highs on strong volume); negative indicate distribution. Sustained CMF > 0.1 = healthy accumulation; < −0.1 = meaningful selling pressure. Default period 20.",
  volOsc: "Volume Oscillator — percent difference between a fast and a slow SMA of volume: ((fast − slow) / slow) × 100. Positive = recent volume above the longer-term average (increased participation, often around breakouts or climax moves); negative = drying up (consolidation, trend exhaustion). Defaults 5/20.",
  aroon: "Aroon Indicator — two lines (Aroon Up / Aroon Down) each bounded 0–100 that measure how recently the N-period high or low occurred. Aroon Up = ((N − bars since highest high) / N) × 100; Aroon Down mirrors for lows. Crossovers flag trend changes; readings above 70 signal strong trend direction, below 30 = absence of trend. Default period 25.",
  vortex: "Vortex Indicator — two lines (VI+ and VI−) that quantify directional movement pressure. VM+ = |high − prev low|, VM− = |low − prev high|; VI+ = ΣVM+/ΣTR, VI− = ΣVM−/ΣTR over N bars. Bullish when VI+ crosses above VI−, bearish on the reverse cross. The wider the spread, the stronger the trend. Default period 14.",
  tii: "Trend Intensity Index — gauges how lopsided recent price deviations from a long-term SMA have been. Computes close − SMA(majorPeriod), sums positive vs absolute negative deviations over minorPeriod bars, then reports 100 × sumPos / (sumPos + sumNeg). Bounded 0–100; readings > 80 = strong uptrend, < 20 = strong downtrend, 50 = balance. Defaults 60/30.",
  zscore: "Price Z-Score — standardised distance of the current close from its rolling SMA, expressed in standard deviations: (close − SMA(N)) / stdev(N). Zero = price sits on the mean; ±2 = a two-sigma stretch (rare); ±3 = extreme. Classic mean-reversion tool: fade extremes back toward zero, or use the zero-line cross as a trend confirmation. Default period 20.",
  bbPctB: "Bollinger %B — where price sits inside its Bollinger Bands, rescaled 0–1: (close − lower) / (upper − lower). %B = 1 means price touches the upper band; 0 means the lower; 0.5 = the middle SMA. Above 1 or below 0 = outside the bands (overextension). Easier to track than the bands themselves for divergences and reversion setups. Defaults period 20, stdDev 2.",
  hurst: "Hurst Exponent — advanced long-memory statistic estimating whether a time series is trending, mean-reverting, or a random walk. Computed via rescaled-range (R/S) analysis across multiple dyadic scales within a lookback window, with the slope of log(R/S) vs log(scale) giving H. H > 0.5 = persistent trends (momentum works); H < 0.5 = anti-persistent / mean-reverting (fade works); H ≈ 0.5 = random walk (neither). Needs long windows to be reliable — default 100.",
  liqSweep: "Liquidity Sweep — detects stop-hunt bars where price briefly pierces a recent N-bar high (or low) and then closes back inside the prior range. A bearish sweep runs the highs then rejects; a bullish sweep runs the lows then reclaims. Markers are placed on the sweeping bar and the swept level is highlighted. Default lookback 10 (use 20–50 for stronger structural sweeps). Works well paired with order-block or supply/demand levels.",
  fvg: "Fair Value Gap (FVG) — three-bar price imbalance where bar[i-2] and bar[i] do not overlap, leaving a 'gap' that the middle bar created with an impulsive move. Bullish FVG when low[i] > high[i-2] (gap is unfilled space below); bearish when high[i] < low[i-2]. Unfilled gaps often act as magnets/support/resistance on revisits. The lookback controls how far back gaps are detected; showFilled toggles whether to keep gaps that have already been traded through.",
  srLevels: "Support/Resistance Levels — auto-detected horizontal levels built from fractal swing pivots. A pivot is a bar whose high (or low) is more extreme than the N bars on each side (strength = N). Nearby pivots are clustered into a single level within a tolerance % band; each level is tagged support/resistance based on its position relative to the current close and ranked by touch count (× recency). The most-touched levels often act as genuine supply/demand zones. Tune: strength (3–5 swing), tolerancePct (0.3–1.5%), maxLevels (5–15).",
  pivots: "Pivot Points — floor-trader levels derived from the prior period's high/low/close. Three variants: classic (PP = (H+L+C)/3, R/S at ±range multiples), fibonacci (R/S at 0.382/0.618/1.0 of range), and camarilla (R/S at close ± k×range, k = 1.1 × {1/12, 1/6, 1/4, 1/2}). Timeframe = weekly (daily charts) or monthly (weekly+ charts). Intraday traders anchor trades and stops against PP/R1/S1; swing traders watch R2/R3 / S2/S3 as extension and climax targets. Levels refresh at each new period boundary.",
  volProfile: "Volume Profile — horizontal distribution of traded volume across price (the 'VPVR' view). Price is binned into N buckets across the lookback window; volume in each bar is spread across the bins it touched. POC (Point of Control) = bin with the highest volume. Value Area = contiguous range around POC containing valueAreaPct (default 70%) of total volume; its bounds are VAH (top) and VAL (bottom). POC/VAH/VAL act as magnets and decision levels; low-volume nodes (LVN) often produce fast moves. Orthogonal to time-series volume indicators.",
  orderBlock: "Order Block — last opposite-colour candle immediately before an impulsive move in the opposite direction. Bullish OB: the last bearish candle before a strong rally (next close > OB high AND move ≥ impulsePct). Bearish OB: the last bullish candle before a sharp drop. The OB zone is the high/low range of that candle, and is marked 'mitigated' once price later revisits it. Unmitigated order blocks often act as supply/demand re-entry zones on retests. Tune: lookback (scan window), impulsePct (move threshold), showMitigated (keep or hide traded-through OBs).",
};

const KIND_DESCRIPTIONS_FR: Record<IndicatorKind, string> = {
  sma: "Moyenne mobile simple — moyenne équipondérée des N dernières clôtures. Lisse le prix pour révéler la direction de la tendance ; le franchissement du prix au-dessus/au-dessous de la SMA est un signal de tendance courant. Périodes typiques : 20 (courte), 50 (moyenne), 200 (longue).",
  ema: "Moyenne mobile exponentielle — moyenne pondérée qui réagit plus vite aux prix récents que la SMA. Souvent utilisée pour les croisements en suivi de tendance (p. ex. EMA 12 vs EMA 26) et comme support/résistance dynamique.",
  rma: "Moyenne mobile de Wilder — lissage exponentiel à décroissance lente (alpha = 1/N). C'est le lissage utilisé à l'intérieur du RSI et de l'ATR ; plus lisse que l'EMA, moins réactive aux pics.",
  wma: "Moyenne mobile pondérée — pondérations linéaires donnant le plus de poids à la clôture la plus récente. Réagit plus vite que la SMA tout en restant plus lisse que l'EMA. Utile pour détecter les tendances à court terme.",
  dema: "Double moyenne mobile exponentielle — EMA à deux passes conçue pour réduire le retard. Épouse le prix de plus près que l'EMA, utile pour capter plus tôt les changements de tendance (au prix d'un peu plus de bruit).",
  vwap: "Cours moyen pondéré par le volume — somme cumulée de (prix typique × volume) divisée par le volume cumulé, où prix typique = (haut + bas + clôture) / 3. Très utilisé par les traders institutionnels et les algos d'exécution comme référence de « juste prix ». Prix au-dessus du VWAP = biais haussier, en dessous = baissier ; populaire en intraday et en day trading. Aucun paramètre de période — calculé depuis la première bougie.",
  rsi: "Indice de force relative — oscillateur de momentum borné 0–100 comparant les gains et pertes moyens sur N périodes. Au-dessus de 70 = suracheté, en dessous de 30 = survendu ; les divergences avec le prix signalent souvent des renversements. Défaut : 14.",
  mom: "Momentum — clôture actuelle moins clôture d'il y a N périodes. Positif = prix en hausse vs il y a N barres, négatif = en baisse. Les franchissements de zéro indiquent un changement de force directionnelle.",
  roc: "Taux de variation — variation en pourcentage par rapport à la clôture d'il y a N périodes. Semblable au Momentum mais normalisé, donc comparable entre niveaux de prix. Sert à repérer accélération, divergence et extrêmes de surachat/survente.",
  macd: "Convergence-divergence de moyennes mobiles — ligne MACD = EMA(rapide) − EMA(lente), ligne de signal = EMA de la MACD, histogramme = MACD − signal. Les croisements de la ligne de signal, les franchissements de zéro et les divergences d'histogramme sont les déclencheurs classiques. Défauts 12/26/9.",
  bbands: "Bandes de Bollinger — SMA(N) centrale avec bandes supérieure/inférieure à K écarts-types. Les bandes s'élargissent en forte volatilité et se resserrent en calme (le « squeeze » précède les cassures) ; les touches près des bandes signalent un excès. Défauts : période 20, écart-type 2.",
  atr: "Écart moyen réel — mesure de volatilité de Wilder : moyenne du « true range » (haut-bas avec ajustement des gaps) sur N périodes. Sert au dimensionnement des stops et des positions, pas à la direction. Défaut : 14.",
  adx: "Indice directionnel moyen — force de la tendance (0–100) dérivée de +DI et −DI. ADX > 25 suggère un marché en tendance ; +DI au-dessus de −DI = tendance haussière, inverse = baissière. Excellent filtre pour les croisements de moyennes mobiles. Défaut : 14.",
  stoch: "Oscillateur stochastique — compare la clôture actuelle à l'intervalle haut/bas sur N périodes. Lignes %K et %D bornées 0–100 ; >80 suracheté, <20 survendu. Les croisements %K/%D près des extrêmes sont le signal classique. Défauts 14/3/3.",
  stochRsi: "Stochastique RSI — applique la formule Stochastic aux valeurs du RSI plutôt qu'au prix. Plus sensible que le RSI simple, capte des cycles surachat/survente plus courts. Plage 0–1 (ou 0–100). Défaut : 14.",
  williamsR: "Williams %R — oscillateur de momentum sur une échelle inversée de −100 à 0. Au-dessus de −20 = suracheté, en dessous de −80 = survendu. Mécaniquement semblable au Stochastic %K mais inversé. Défaut : 14.",
  obv: "Volume d'équilibre — volume cumulé : ajoute le volume des jours haussiers, retranche celui des jours baissiers. Un OBV haussier confirme les tendances ; les divergences avec le prix précèdent souvent les renversements. La direction compte plus que le niveau absolu.",
  psar: "SAR parabolique — points de « stop-and-reverse » en suivi de tendance qui basculent du dessous du prix (tendance haussière) au-dessus (tendance baissière). Utilisé comme stop suiveur ou filtre de tendance. Défauts : pas 0,02, max 0,2.",
  maCross: "Croisement de moyennes mobiles — trace une moving average rapide et une lente sur le graphique des prix et marque chaque croisement. Le classique 50/200 en SMA donne le « Golden Cross » (la rapide franchit la lente à la hausse — régime haussier) et le « Death Cross » (franchissement à la baisse). Périodes et type (SMA/EMA) configurables.",
  macdCross: "Croisement du signal MACD — exécute la MACD et marque chaque franchissement de la ligne de signal : flèche haute = haussier, flèche basse = baissier. À utiliser avec un filtre de tendance pour éviter les faux signaux en marché chaotique. Défauts 12/26/9.",
  fib: "Retracement de Fibonacci — trace des niveaux horizontaux (23,6 %, 38,2 %, 50 %, 61,8 %, 78,6 %) entre le plus haut et le plus bas de la plage chargée (ou des N dernières bougies si un lookback est défini). La direction (retracement d'une tendance haussière ou baissière) est détectée automatiquement selon le dernier swing. Populaire chez les traders discrétionnaires comme zones potentielles de repli/support ; les niveaux 38,2 %, 50 % et 61,8 % sont les plus surveillés. L'efficacité vient en partie d'une prophétie auto-réalisatrice — attendez-vous à des réactions, pas à des garanties.",
  keltner: "Canaux de Keltner — enveloppe de volatilité autour d'une EMA(période) avec bandes supérieure/inférieure à ATR(atrPériode) × multiplicateur. Contrairement aux Bandes de Bollinger (écart-type), Keltner utilise le true range : bandes plus lisses et moins sensibles aux faux signaux. Le prix longeant la bande supérieure signale une forte tendance haussière ; les cassures hors du canal marquent souvent un démarrage de tendance. Défauts période 20, ATR 20, multiplicateur 2.",
  donchian: "Canaux de Donchian — bande supérieure = plus haut des N dernières bougies, bande inférieure = plus bas des N dernières, centre = leur moyenne. Le signal de cassure originel des Turtle Traders : achat sur clôture au-dessus de la bande supérieure, sortie sous la bande inférieure. Utile aussi comme stop suiveur et repère de support/résistance. Défaut : période 20 (cassure classique des Turtles).",
  chaikinVol: "Volatilité de Chaikin — mesure le taux de variation d'une EMA(emaPériode) de (haut − bas) sur les rocPériode dernières bougies, en pourcentage. Des valeurs en hausse indiquent une volatilité en expansion (souvent lors de cassures ou mouvements de panique) ; en baisse, des plages qui se contractent (consolidation). Contrairement à l'ATR qui suit la plage absolue, Chaikin Vol suit la variation relative — utile pour repérer les changements de régime de volatilité. Défauts 10/10.",
  ad: "Accumulation/Distribution — volume cumulé pondéré par la position de la clôture dans la plage de chaque bougie : proche du haut = ajout, proche du bas = soustraction. Similaire à l'OBV mais plus nuancé, car les bougies partielles contribuent partiellement. Une A/D haussière avec prix haussier confirme la tendance ; les divergences (prix en hausse, A/D plate ou en baisse) précèdent souvent les retournements.",
  cmf: "Chaikin Money Flow — somme du Money Flow Volume sur N bougies divisée par la somme du volume sur la même fenêtre. Borné environ entre −1 et +1. Des valeurs positives indiquent une pression acheteuse (clôtures proches des hauts avec fort volume) ; négatives, une distribution. Un CMF soutenu > 0,1 = accumulation saine ; < −0,1 = pression vendeuse significative. Défaut : période 20.",
  volOsc: "Oscillateur de volume — différence en pourcentage entre une SMA rapide et une SMA lente du volume : ((rapide − lente) / lente) × 100. Positif = volume récent au-dessus de la moyenne long terme (participation accrue, souvent autour des cassures ou des mouvements climax) ; négatif = assèchement (consolidation, essoufflement de tendance). Défauts 5/20.",
  aroon: "Indicateur Aroon — deux lignes (Aroon Up / Aroon Down) bornées 0–100 qui mesurent à quel point le plus haut ou le plus bas sur N périodes est récent. Aroon Up = ((N − barres depuis le plus haut) / N) × 100 ; Aroon Down est le miroir pour les plus bas. Les croisements signalent des changements de tendance ; au-dessus de 70 = direction de tendance forte, en dessous de 30 = absence de tendance. Défaut : période 25.",
  vortex: "Indicateur Vortex — deux lignes (VI+ et VI−) qui quantifient la pression de mouvement directionnel. VM+ = |haut − bas préc.|, VM− = |bas − haut préc.| ; VI+ = ΣVM+/ΣTR, VI− = ΣVM−/ΣTR sur N barres. Haussier lorsque VI+ franchit VI− à la hausse, baissier sur le croisement inverse. Plus l'écart est large, plus la tendance est forte. Défaut : période 14.",
  tii: "Indice d'intensité de tendance — mesure à quel point les écarts récents du prix à une SMA long terme sont asymétriques. Calcule close − SMA(majorPeriod), somme les écarts positifs contre les écarts négatifs absolus sur minorPeriod barres, puis rapporte 100 × sommePos / (sommePos + sommeNeg). Borné 0–100 ; > 80 = forte tendance haussière, < 20 = forte tendance baissière, 50 = équilibre. Défauts 60/30.",
  zscore: "Score Z du prix — distance standardisée de la clôture par rapport à sa SMA glissante, exprimée en écarts-types : (clôture − SMA(N)) / écart-type(N). Zéro = le prix se situe sur la moyenne ; ±2 = étirement à deux sigmas (rare) ; ±3 = extrême. Outil classique de retour à la moyenne : fader les extrêmes vers zéro, ou utiliser le franchissement de zéro comme confirmation de tendance. Défaut : période 20.",
  bbPctB: "Bollinger %B — position du prix dans ses Bandes de Bollinger, rééchelonnée 0–1 : (clôture − inférieure) / (supérieure − inférieure). %B = 1 signifie que le prix touche la bande supérieure ; 0 la bande inférieure ; 0,5 = la SMA centrale. Au-dessus de 1 ou en dessous de 0 = hors bandes (excès). Plus facile à suivre que les bandes elles-mêmes pour détecter divergences et setups de retour à la moyenne. Défauts : période 20, écart-type 2.",
  hurst: "Exposant de Hurst — statistique avancée de mémoire longue estimant si une série temporelle est en tendance, en retour à la moyenne, ou une marche aléatoire. Calculé par l'analyse d'étendue réajustée (R/S) sur plusieurs échelles dyadiques dans une fenêtre de lookback ; la pente de log(R/S) vs log(échelle) donne H. H > 0,5 = tendances persistantes (le momentum fonctionne) ; H < 0,5 = anti-persistant / retour à la moyenne (le fade fonctionne) ; H ≈ 0,5 = marche aléatoire (ni l'un ni l'autre). Nécessite de longues fenêtres pour être fiable — défaut : 100.",
  liqSweep: "Sweep de liquidité — détecte les barres de « chasse aux stops » où le prix perce brièvement un plus haut (ou plus bas) sur N barres puis clôture à l'intérieur de la plage précédente. Un sweep baissier balaie les hauts puis rejette ; un sweep haussier balaie les bas puis reprend. Des marqueurs sont placés sur la barre de sweep et le niveau balayé est surligné. Défaut lookback 10 (utilisez 20–50 pour des sweeps structurels plus forts). Fonctionne bien couplé à des order blocks ou zones d'offre/demande.",
  fvg: "Fair Value Gap (FVG) — déséquilibre de prix sur trois barres où barre[i-2] et barre[i] ne se chevauchent pas, laissant un « trou » créé par la barre du milieu avec un mouvement impulsif. FVG haussier lorsque bas[i] > haut[i-2] (espace non rempli en dessous) ; baissier lorsque haut[i] < bas[i-2]. Les gaps non remplis agissent souvent comme des aimants / supports / résistances lors des revisites. Le lookback contrôle jusqu'où remonter pour détecter les gaps ; showFilled bascule l'affichage des gaps déjà traversés.",
  srLevels: "Niveaux de support/résistance — niveaux horizontaux auto-détectés à partir de pivots fractaux. Un pivot est une barre dont le haut (ou bas) dépasse celui des N barres de chaque côté (strength = N). Les pivots proches sont regroupés en un même niveau dans une tolérance en % ; chaque niveau est classé support/résistance selon sa position par rapport à la clôture courante, puis ordonné par nombre de touches (× fraîcheur). Les niveaux les plus touchés agissent souvent comme de véritables zones d'offre/demande. Paramètres : strength (3–5 swing), tolerancePct (0,3–1,5 %), maxLevels (5–15).",
  pivots: "Points pivots — niveaux de « floor trader » dérivés du haut/bas/clôture de la période précédente. Trois variantes : classique (PP = (H+B+C)/3, R/S à ± multiples de la range), fibonacci (R/S à 0,382/0,618/1,0 × range) et camarilla (R/S à close ± k×range, k = 1,1 × {1/12, 1/6, 1/4, 1/2}). Timeframe = weekly (graphiques daily) ou monthly (weekly+). Les traders intraday ancrent leurs entrées/stops sur PP/R1/S1 ; les swing traders surveillent R2/R3 / S2/S3 comme cibles d'extension. Les niveaux se renouvellent à chaque nouvelle période.",
  volProfile: "Profil de volume — distribution horizontale du volume échangé par niveau de prix (vue « VPVR »). Le prix est réparti en N bins sur la fenêtre lookback ; le volume de chaque bougie est redistribué sur les bins qu'elle touche. POC (Point of Control) = bin au plus fort volume. La Value Area = plage contiguë autour du POC contenant valueAreaPct (défaut 70 %) du volume total ; ses bornes sont VAH (haut) et VAL (bas). POC/VAH/VAL agissent comme aimants et niveaux de décision ; les LVN (low-volume nodes) favorisent les mouvements rapides. Orthogonal aux indicateurs de volume temporels.",
  orderBlock: "Order Block — dernière bougie de couleur opposée juste avant un mouvement impulsif. OB haussier : dernière bougie baissière avant un rally fort (close suivante > haut de l'OB ET mouvement ≥ impulsePct). OB baissier : dernière bougie haussière avant une chute nette. La zone d'OB est la plage haut/bas de cette bougie, marquée « mitigée » lorsque le prix revient dans la zone. Les order blocks non mitigés agissent souvent comme zones d'offre/demande pour les ré-entrées sur retest. Paramètres : lookback (fenêtre), impulsePct (seuil de mouvement), showMitigated (garder ou masquer les OBs traversés).",
};

export function kindDescription(kind: IndicatorKind, lang: Lang = "en"): string {
  return (lang === "fr" ? KIND_DESCRIPTIONS_FR : KIND_DESCRIPTIONS_EN)[kind];
}

const KIND_ONELINER_EN: Record<IndicatorKind, string> = {
  sma: "Price above a rising SMA = uptrend, below a falling SMA = downtrend.",
  ema: "Faster than SMA — EMA crossovers (e.g. 12/26) catch trend shifts earlier.",
  rma: "Smoother than EMA — the internal smoothing behind RSI and ATR.",
  wma: "Reacts faster than SMA, smoother than EMA — good for short-term trend detection.",
  dema: "Reduced-lag EMA — catches trend changes earlier at the cost of more noise.",
  vwap: "Price above VWAP = bullish intraday bias, below = bearish — the institutional fair-price benchmark.",
  rsi: "Classic levels: above 70 = overbought, below 30 = oversold (use 80/20 in strong trends).",
  mom: "Close minus close N bars ago — zero-line crossings flag directional shifts.",
  roc: "Percent change vs N bars ago — spot acceleration and divergences across any price level.",
  macd: "Signal-line crossovers, zero-line crossings, histogram divergences — triple trigger system.",
  bbands: "Bands widen on volatility, narrow before breakouts (the 'squeeze'); touches flag overextension.",
  atr: "Measures volatility, not direction — use for stop-loss and position sizing.",
  adx: "ADX > 25 = trending market; +DI above −DI = up, reverse = down.",
  stoch: "%K/%D crossovers near 80 (overbought) or 20 (oversold) are the classic signals.",
  stochRsi: "More sensitive than plain RSI — catches shorter overbought/oversold cycles.",
  williamsR: "Above −20 = overbought, below −80 = oversold — inverted Stochastic %K.",
  obv: "Rising OBV confirms uptrends; divergence with price often precedes reversals.",
  psar: "Dots below price = uptrend, above = downtrend — acts as a trailing stop.",
  maCross: "Golden Cross (50 above 200) = bullish regime, Death Cross = bearish.",
  macdCross: "Flags every MACD/signal crossover — use with a trend filter to avoid whipsaws.",
  fib: "Classic pullback zones: 38.2%, 50%, 61.8% — reactions, not guarantees.",
  keltner: "EMA envelope with ATR-based bands — smoother than Bollinger; channel breaks mark trend starts.",
  donchian: "Classic turtle breakout: buy above upper, sell below lower band over N bars.",
  chaikinVol: "Rate of change of EMA(H−L) — rising = volatility expanding, falling = contracting.",
  ad: "Cumulative volume weighted by close position in range — confirms trend, divergences warn of reversal.",
  cmf: "Positive = accumulation, negative = distribution; sustained |CMF| > 0.1 is meaningful.",
  volOsc: "% difference of fast vs slow volume SMA — positive = participation rising, negative = drying up.",
  aroon: "Aroon Up/Down (0–100) — tracks how recently the period high/low printed; crossovers flag trend changes.",
  vortex: "VI+ / VI− crossovers flag trend changes; wider spread = stronger trend.",
  tii: "0–100 — above 80 = strong uptrend, below 20 = strong downtrend, near 50 = no trend.",
  zscore: "Standardised distance from the mean in σ — ±2 is stretched, ±3 extreme; classic mean-reversion fade.",
  bbPctB: "0–1 inside the Bollinger Bands; >1 or <0 = outside, overextension warning.",
  hurst: "H > 0.5 = trending (momentum works), < 0.5 = mean-reverting, ≈ 0.5 = random walk.",
  liqSweep: "Stop-hunt bars that pierce N-bar highs/lows then close back inside — classic SMC structure trigger.",
  fvg: "Three-bar price imbalance — unfilled gaps often act as magnets and support/resistance on revisits.",
  srLevels: "Auto-detected horizontal support/resistance from clustered swing pivots — ranked by touches.",
  pivots: "Floor-trader pivot levels (classic, fibonacci, or camarilla) from prior period's H/L/C.",
  volProfile: "Horizontal volume distribution — POC, VAH, VAL mark price magnets and decision levels.",
  orderBlock: "Last opposite-colour candle before an impulsive move — often a supply/demand re-entry zone.",
};

const KIND_ONELINER_FR: Record<IndicatorKind, string> = {
  sma: "Prix au-dessus d'une SMA haussière = tendance haussière, en dessous = baissière.",
  ema: "Plus rapide que la SMA — les croisements EMA (ex. 12/26) captent plus tôt les retournements.",
  rma: "Plus lisse que l'EMA — le lissage interne du RSI et de l'ATR.",
  wma: "Réagit plus vite que la SMA, plus lisse que l'EMA — idéale pour les tendances court terme.",
  dema: "EMA à retard réduit — capte les changements de tendance plus tôt, avec un peu plus de bruit.",
  vwap: "Prix au-dessus du VWAP = biais haussier intraday, en dessous = baissier — référence institutionnelle de juste prix.",
  rsi: "Niveaux classiques : au-dessus de 70 = suracheté, en dessous de 30 = survendu (80/20 en forte tendance).",
  mom: "Clôture moins clôture il y a N barres — les franchissements de zéro signalent un changement directionnel.",
  roc: "Variation en % vs N barres — repère accélération et divergences quel que soit le niveau de prix.",
  macd: "Croisements du signal, franchissements de zéro, divergences de l'histogramme — triple déclencheur.",
  bbands: "Les bandes s'élargissent en volatilité, se resserrent avant les cassures ; les touches signalent un excès.",
  atr: "Mesure la volatilité, pas la direction — utilisé pour dimensionner stops et positions.",
  adx: "ADX > 25 = marché en tendance ; +DI au-dessus de −DI = hausse, inverse = baisse.",
  stoch: "Croisements %K/%D près de 80 (suracheté) ou 20 (survendu) : les signaux classiques.",
  stochRsi: "Plus sensible que le RSI simple — capte des cycles surachat/survente plus courts.",
  williamsR: "Au-dessus de −20 = suracheté, en dessous de −80 = survendu — Stochastic %K inversé.",
  obv: "Un OBV haussier confirme la tendance ; les divergences avec le prix précèdent souvent les renversements.",
  psar: "Points sous le prix = tendance haussière, au-dessus = baissière — sert de stop suiveur.",
  maCross: "Golden Cross (50 au-dessus de 200) = régime haussier, Death Cross = baissier.",
  macdCross: "Signale chaque croisement MACD/signal — à combiner avec un filtre de tendance.",
  fib: "Zones de repli classiques : 38,2 %, 50 %, 61,8 % — réactions, pas garanties.",
  keltner: "Enveloppe EMA avec bandes ATR — plus lisse que Bollinger ; les cassures du canal marquent les débuts de tendance.",
  donchian: "Cassure Turtle classique : achat au-dessus de la bande supérieure, vente sous la bande inférieure sur N bougies.",
  chaikinVol: "Taux de variation de EMA(H−B) — en hausse = volatilité qui s'étend, en baisse = qui se contracte.",
  ad: "Volume cumulé pondéré par la position de la clôture — confirme la tendance, les divergences alertent d'un retournement.",
  cmf: "Positif = accumulation, négatif = distribution ; un |CMF| soutenu > 0,1 est significatif.",
  volOsc: "Écart % entre SMA rapide et lente du volume — positif = participation en hausse, négatif = qui s'assèche.",
  aroon: "Aroon Up/Down (0–100) — suit la fraîcheur du plus haut/plus bas ; les croisements signalent des changements de tendance.",
  vortex: "Croisements VI+ / VI− : signalent des changements de tendance ; écart large = tendance forte.",
  tii: "0–100 — au-dessus de 80 = forte tendance haussière, en dessous de 20 = forte tendance baissière, autour de 50 = pas de tendance.",
  zscore: "Distance standardisée à la moyenne en σ — ±2 étiré, ±3 extrême ; fade classique de retour à la moyenne.",
  bbPctB: "0–1 dans les Bandes de Bollinger ; >1 ou <0 = hors bandes, excès.",
  hurst: "H > 0,5 = tendance (le momentum fonctionne), < 0,5 = retour à la moyenne, ≈ 0,5 = marche aléatoire.",
  liqSweep: "Barres de chasse aux stops qui percent les hauts/bas sur N barres puis clôturent à l'intérieur — déclencheur SMC classique.",
  fvg: "Déséquilibre de prix sur trois barres — les gaps non remplis agissent souvent comme aimants et support/résistance lors des revisites.",
  srLevels: "Support/résistance auto-détectés à partir de pivots de swing regroupés — classés par touches.",
  pivots: "Points pivots de floor-trader (classique, fibonacci ou camarilla) à partir du H/B/C précédent.",
  volProfile: "Distribution horizontale du volume — POC, VAH, VAL marquent les aimants et niveaux de décision.",
  orderBlock: "Dernière bougie opposée avant un mouvement impulsif — souvent une zone d'offre/demande pour la ré-entrée.",
};

export function kindOneliner(kind: IndicatorKind, lang: Lang = "en"): string {
  return (lang === "fr" ? KIND_ONELINER_FR : KIND_ONELINER_EN)[kind];
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
    case "zscore":
    case "hurst":
      return `${kindLabel(spec.kind)} ${spec.period}`;
    case "macd":
      return `MACD ${spec.fast}/${spec.slow}/${spec.signal}`;
    case "bbands":
      return `BBands ${spec.period}/${spec.stdDev}`;
    case "bbPctB":
      return `BB %B ${spec.period}/${spec.stdDev}`;
    case "stoch":
      return `Stoch ${spec.period}/${spec.signal}/${spec.smooth}`;
    case "obv":
      return "OBV";
    case "vwap":
      return "VWAP";
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
    case "fib":
      return spec.lookback != null ? `Fib (${spec.lookback})` : "Fib";
    case "keltner":
      return `Keltner ${spec.period}/${spec.atrPeriod}×${spec.multiplier}`;
    case "donchian":
      return `Donchian ${spec.period}`;
    case "chaikinVol":
      return `Chaikin Vol ${spec.emaPeriod}/${spec.rocPeriod}`;
    case "ad":
      return "A/D";
    case "cmf":
      return `CMF ${spec.period}`;
    case "volOsc":
      return `Vol Osc ${spec.fast}/${spec.slow}`;
    case "aroon":
      return `Aroon ${spec.period}`;
    case "vortex":
      return `Vortex ${spec.period}`;
    case "tii":
      return `TII ${spec.majorPeriod}/${spec.minorPeriod}`;
    case "liqSweep":
      return `Liq Sweep ${spec.lookback}`;
    case "fvg":
      return `FVG ${spec.lookback}${spec.showFilled ? " (+filled)" : ""}`;
    case "srLevels":
      return `S/R ${spec.lookback}×${spec.strength} (${spec.tolerancePct}%)`;
    case "pivots":
      return `${spec.method === "classic" ? "Pivots" : spec.method === "fib" ? "Fib Pivots" : "Camarilla"} (${spec.timeframe === "weekly" ? "W" : "M"})`;
    case "volProfile":
      return `Vol Profile ${spec.lookback}/${spec.bins}b (${Math.round(spec.valueAreaPct * 100)}%)`;
    case "orderBlock":
      return `OB ${spec.lookback} ≥${spec.impulsePct}%${spec.showMitigated ? " (+mit)" : ""}`;
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

function sortKey(spec: IndicatorSpec): string {
  const prefix = kindLabel(spec.kind).toLowerCase();
  const pad = (n: number) => String(n).padStart(5, "0");
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
    case "zscore":
    case "hurst":
      return `${prefix}|${pad(spec.period)}`;
    case "macd":
    case "macdCross":
      return `${prefix}|${pad(spec.fast)}|${pad(spec.slow)}|${pad(spec.signal)}`;
    case "bbands":
    case "bbPctB":
      return `${prefix}|${pad(spec.period)}|${pad(Math.round(spec.stdDev * 100))}`;
    case "stoch":
      return `${prefix}|${pad(spec.period)}|${pad(spec.signal)}|${pad(spec.smooth)}`;
    case "psar":
      return `${prefix}|${pad(Math.round(spec.step * 10000))}|${pad(Math.round(spec.max * 10000))}`;
    case "maCross":
      return `${prefix}|${spec.maType}|${pad(spec.fastPeriod)}|${pad(spec.slowPeriod)}`;
    case "obv":
    case "vwap":
      return prefix;
    case "fib":
      return `${prefix}|${pad(spec.lookback ?? 0)}`;
    case "donchian":
      return `${prefix}|${pad(spec.period)}`;
    case "keltner":
      return `${prefix}|${pad(spec.period)}|${pad(spec.atrPeriod)}|${pad(Math.round(spec.multiplier * 100))}`;
    case "chaikinVol":
      return `${prefix}|${pad(spec.emaPeriod)}|${pad(spec.rocPeriod)}`;
    case "ad":
      return prefix;
    case "cmf":
      return `${prefix}|${pad(spec.period)}`;
    case "volOsc":
      return `${prefix}|${pad(spec.fast)}|${pad(spec.slow)}`;
    case "aroon":
    case "vortex":
      return `${prefix}|${pad(spec.period)}`;
    case "tii":
      return `${prefix}|${pad(spec.majorPeriod)}|${pad(spec.minorPeriod)}`;
    case "liqSweep":
      return `${prefix}|${pad(spec.lookback)}`;
    case "fvg":
      return `${prefix}|${pad(spec.lookback)}|${spec.showFilled ? "1" : "0"}`;
    case "srLevels":
      return `${prefix}|${pad(spec.lookback)}|${pad(spec.strength)}|${pad(Math.round(spec.tolerancePct * 100))}|${pad(spec.maxLevels)}`;
    case "pivots":
      return `${prefix}|${spec.method}|${spec.timeframe}`;
    case "volProfile":
      return `${prefix}|${pad(spec.lookback)}|${pad(spec.bins)}|${pad(Math.round(spec.valueAreaPct * 100))}|${spec.showHistogram ? "1" : "0"}`;
    case "orderBlock":
      return `${prefix}|${pad(spec.lookback)}|${pad(Math.round(spec.impulsePct * 100))}|${spec.showMitigated ? "1" : "0"}`;
  }
}

export function sortIndicators<T extends { spec: IndicatorSpec }>(items: T[]): T[] {
  return [...items].sort((a, b) => sortKey(a.spec).localeCompare(sortKey(b.spec)));
}

export const DEFAULT_SEED: ActiveIndicator[] = [
  { localId: newId(), spec: { kind: "sma", period: 50 }, color: defaultColor("sma") },
  { localId: newId(), spec: { kind: "rsi", period: 14 }, color: defaultColor("rsi") },
  { localId: newId(), spec: { kind: "macd", fast: 12, slow: 26, signal: 9 }, color: defaultColor("macd") },
  { localId: newId(), spec: { kind: "bbands", period: 20, stdDev: 2 }, color: defaultColor("bbands") },
];
