/**
 * @fileoverview Client-side backtest engine.
 *
 * Runs entirely in the browser against `RouterOutputs["market"]["analyze"]`,
 * so the indicator series fed to strategies is exactly the one the chart is
 * displaying — no double-fetching, no drift between visual and signal.
 *
 * Exports:
 *   - `runBacktest(candles, results, strategyKind, config, lang)`
 *       Single-symbol simulation. ATR-sized positions, configurable risk %,
 *       stop = entry ± stopAtrMult × ATR, take-profit = stop × takeProfitR.
 *       Slippage and fees apply on entry and exit. Conservative intra-bar
 *       fill: when stop and TP are both touched, the stop wins.
 *   - `runSweep(...)`         — 2-D parameter grid (e.g. stop × TP).
 *   - `runPortfolio(...)`     — equal-weight or custom-weight multi-symbol,
 *                               aggregated into a single equity curve.
 *
 * Adding a strategy:
 *   1. Implement it in `strategy-signals.ts` and register the kind in
 *      `strategy-guide.ts`.
 *   2. Add it to `BACKTEST_SUPPORTED_STRATEGIES` here, plus its required
 *      indicator preset in `BACKTEST_STRATEGY_INDICATORS`.
 */
import type { RouterOutputs } from "@finatalk/trpc";
import type { Lang } from "@/lib/lang";
import type { IndicatorSpec } from "@/lib/indicator-defaults";
import { evaluateStrategy } from "@/lib/strategy-signals";
import type { StrategyKind } from "@/lib/strategy-guide";

type AnalyzeResult = RouterOutputs["market"]["analyze"]["results"][number];
type Candle = RouterOutputs["market"]["analyze"]["candles"][number];

export type { AnalyzeResult as BacktestAnalyzeResult, Candle as BacktestCandle };

export const BACKTEST_SUPPORTED_STRATEGIES = [
  "faberTrendFilter",
  "trendPullback",
  "breakoutMomentum",
  "meanReversion",
  "maCrossover",
  "vwapStrategy",
  "donchianTurtleBreakout",
  "trendStructureVolatility",
  "supportResistancePullback",
  "openingRangeBreakout",
  "volumeProfileRotation",
  "orderBlockRetest",
  "pivotPointReaction",
  "liqSweepReversal",
] as const satisfies readonly StrategyKind[];
export type BacktestStrategy = (typeof BACKTEST_SUPPORTED_STRATEGIES)[number];

export const BACKTEST_STRATEGY_INDICATORS: Record<BacktestStrategy, IndicatorSpec[]> = {
  faberTrendFilter: [
    { kind: "sma", period: 200 },
    { kind: "atr", period: 14 },
  ],
  trendPullback: [
    { kind: "ema", period: 50 },
    { kind: "rsi", period: 14 },
    { kind: "vwap" },
    { kind: "atr", period: 14 },
  ],
  breakoutMomentum: [
    { kind: "donchian", period: 20 },
    { kind: "atr", period: 14 },
    { kind: "rsi", period: 14 },
    { kind: "macd", fast: 12, slow: 26, signal: 9 },
  ],
  meanReversion: [
    { kind: "rsi", period: 14 },
    { kind: "bbands", period: 20, stdDev: 2 },
    { kind: "bbPctB", period: 20, stdDev: 2 },
    { kind: "zscore", period: 20 },
    { kind: "adx", period: 14 },
    { kind: "atr", period: 14 },
  ],
  maCrossover: [
    { kind: "maCross", fastPeriod: 50, slowPeriod: 200, maType: "sma" },
    { kind: "atr", period: 14 },
  ],
  vwapStrategy: [
    { kind: "vwap" },
    { kind: "rsi", period: 14 },
    { kind: "macd", fast: 12, slow: 26, signal: 9 },
    { kind: "atr", period: 14 },
  ],
  donchianTurtleBreakout: [
    { kind: "donchian", period: 20 },
    { kind: "atr", period: 14 },
  ],
  trendStructureVolatility: [
    { kind: "ema", period: 50 },
    { kind: "adx", period: 14 },
    { kind: "rsi", period: 14 },
    { kind: "atr", period: 14 },
    { kind: "keltner", period: 20, atrPeriod: 20, multiplier: 2 },
    { kind: "vwap" },
  ],
  supportResistancePullback: [
    { kind: "srLevels", lookback: 500, strength: 3, tolerancePct: 0.5, maxLevels: 8 },
    { kind: "atr", period: 14 },
  ],
  openingRangeBreakout: [
    { kind: "atr", period: 14 },
  ],
  volumeProfileRotation: [
    { kind: "volProfile", lookback: 200, bins: 40, valueAreaPct: 0.7, showHistogram: false },
    { kind: "atr", period: 14 },
  ],
  orderBlockRetest: [
    { kind: "orderBlock", lookback: 200, impulsePct: 1.5, showMitigated: false },
    { kind: "atr", period: 14 },
  ],
  pivotPointReaction: [
    { kind: "pivots", method: "classic", timeframe: "weekly" },
    { kind: "atr", period: 14 },
  ],
  liqSweepReversal: [
    { kind: "liqSweep", lookback: 10 },
    { kind: "atr", period: 14 },
  ],
};

export type BacktestConfig = {
  initialCapital: number;
  riskPct: number;
  stopAtrMult: number;
  takeProfitR: number;
  feeBps: number;
  slippageBps: number;
  enableShorts: boolean;
};

export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  initialCapital: 10_000,
  riskPct: 1,
  stopAtrMult: 2,
  takeProfitR: 2,
  feeBps: 5,
  slippageBps: 5,
  enableShorts: false,
};

export type TradeSide = "long" | "short";

export type TradeExitReason = "takeProfit" | "stop" | "exitSignal" | "endOfData";

export type Trade = {
  entryTime: number;
  entryPrice: number;
  exitTime: number;
  exitPrice: number;
  qty: number;
  side: TradeSide;
  stop: number;
  takeProfit: number;
  pnl: number;
  pnlPct: number;
  rMultiple: number;
  reason: TradeExitReason;
  bars: number;
};

export type EquityPoint = { time: number; equity: number };

export type BacktestMetrics = {
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  winRate: number;
  avgRMultiple: number;
  avgTradePct: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  longTrades: number;
  shortTrades: number;
  sharpe: number;
  totalDays: number;
  finalEquity: number;
  benchmarkTotalReturn: number;
  benchmarkCagr: number;
};

export type BacktestResult = {
  config: BacktestConfig;
  trades: Trade[];
  equityCurve: EquityPoint[];
  benchmarkCurve: EquityPoint[];
  metrics: BacktestMetrics;
};

type OpenTrade = {
  entryTime: number;
  entryPrice: number;
  qty: number;
  side: TradeSide;
  stop: number;
  takeProfit: number;
  initialRisk: number;
  entryBarIdx: number;
};

function bps(n: number): number {
  return n / 10_000;
}

function truncateResult(r: AnalyzeResult, maxTime: number): AnalyzeResult {
  // Snapshot-style indicators (levels/blocks/profile) are not used by Phase 1
  // strategies; pass them through unchanged.
  switch (r.kind) {
    case "sma":
    case "ema":
    case "rma":
    case "wma":
    case "dema":
    case "rsi":
    case "mom":
    case "roc":
    case "atr":
    case "stochRsi":
    case "williamsR":
    case "zscore":
    case "bbPctB":
    case "hurst":
    case "vwap":
    case "obv":
    case "ad":
    case "cmf":
    case "chaikinVol":
    case "tii":
    case "volOsc":
    case "macd":
    case "macdCross":
    case "bbands":
    case "keltner":
    case "donchian":
    case "adx":
    case "stoch":
    case "aroon":
    case "vortex":
    case "psar": {
      const series = (r.series as { time: number }[]).filter((p) => p.time <= maxTime);
      return { ...r, series } as AnalyzeResult;
    }
    case "maCross": {
      const s = r.series;
      return {
        ...r,
        series: {
          fast: s.fast.filter((p) => p.time <= maxTime),
          slow: s.slow.filter((p) => p.time <= maxTime),
          events: s.events.filter((e) => e.time <= maxTime),
        },
      } as AnalyzeResult;
    }
    default:
      return r;
  }
}

function findAtrAt(results: AnalyzeResult[], maxTime: number): number | undefined {
  for (const r of results) {
    if (r.kind === "atr") {
      let last: number | undefined;
      for (const p of r.series) {
        if (p.time > maxTime) break;
        last = p.value;
      }
      if (last != null) return last;
    }
  }
  return undefined;
}

function closeTrade(
  open: OpenTrade,
  exitTime: number,
  exitPrice: number,
  config: BacktestConfig,
  reason: TradeExitReason,
  barsHeld: number,
): Trade {
  const feeIn = open.entryPrice * open.qty * bps(config.feeBps);
  const feeOut = exitPrice * open.qty * bps(config.feeBps);
  const direction = open.side === "long" ? 1 : -1;
  const grossPnl = (exitPrice - open.entryPrice) * open.qty * direction;
  const pnl = grossPnl - feeIn - feeOut;
  const pnlPct = (pnl / (open.entryPrice * open.qty)) * 100;
  const rMultiple = open.initialRisk > 0 ? pnl / open.initialRisk : 0;
  return {
    entryTime: open.entryTime,
    entryPrice: open.entryPrice,
    exitTime,
    exitPrice,
    qty: open.qty,
    side: open.side,
    stop: open.stop,
    takeProfit: open.takeProfit,
    pnl,
    pnlPct,
    rMultiple,
    reason,
    bars: barsHeld,
  };
}

export function runBacktest(
  candles: Candle[],
  results: AnalyzeResult[],
  strategyKind: BacktestStrategy,
  config: BacktestConfig,
  lang: Lang = "en",
): BacktestResult {
  const equityCurve: EquityPoint[] = [];
  const trades: Trade[] = [];
  const initialEquity = config.initialCapital;
  let equity = initialEquity;
  let open: OpenTrade | null = null;

  let warmupStart = 0;
  for (let i = 0; i < candles.length; i++) {
    if (findAtrAt(results, candles[i]!.time) != null) {
      warmupStart = i;
      break;
    }
  }

  for (let i = warmupStart; i < candles.length; i++) {
    const bar = candles[i]!;

    if (open) {
      const hitStop = open.side === "long" ? bar.low <= open.stop : bar.high >= open.stop;
      const hitTp = open.side === "long" ? bar.high >= open.takeProfit : bar.low <= open.takeProfit;
      if (hitStop || hitTp) {
        // Conservative: if both touched intra-bar, assume stop filled first
        const rawExit = hitStop ? open.stop : open.takeProfit;
        const reason: TradeExitReason = hitStop ? "stop" : "takeProfit";
        const slipSign = open.side === "long" ? -1 : 1;
        const exitPrice = rawExit * (1 + slipSign * bps(config.slippageBps));
        const trade = closeTrade(open, bar.time, exitPrice, config, reason, i - open.entryBarIdx);
        trades.push(trade);
        equity += trade.pnl;
        open = null;
      }
    }

    const truncated = results.map((r) => truncateResult(r, bar.time));
    const candleWindow = candles.slice(0, i + 1);
    const signal = evaluateStrategy(strategyKind, truncated, candleWindow, lang);

    if (open && signal) {
      const longExit = open.side === "long" && (signal.action === "sell" || signal.action === "exitLong");
      const shortExit = open.side === "short" && (signal.action === "buy" || signal.action === "exitShort");
      if (longExit || shortExit) {
        const slipSign = open.side === "long" ? -1 : 1;
        const exitPrice = bar.close * (1 + slipSign * bps(config.slippageBps));
        const trade = closeTrade(open, bar.time, exitPrice, config, "exitSignal", i - open.entryBarIdx);
        trades.push(trade);
        equity += trade.pnl;
        open = null;
      }
    }

    if (!open && signal && i + 1 < candles.length) {
      const wantLong = signal.action === "buy";
      const wantShort = signal.action === "sell" && config.enableShorts;
      if (wantLong || wantShort) {
        const side: TradeSide = wantLong ? "long" : "short";
        const next = candles[i + 1]!;
        const atr = findAtrAt(results, bar.time);
        if (atr != null && atr > 0) {
          const slipSign = side === "long" ? 1 : -1;
          const entryPrice = next.open * (1 + slipSign * bps(config.slippageBps));
          const stopDist = atr * config.stopAtrMult;
          if (stopDist > 0) {
            const stop = side === "long" ? entryPrice - stopDist : entryPrice + stopDist;
            const takeProfit =
              side === "long"
                ? entryPrice + stopDist * config.takeProfitR
                : entryPrice - stopDist * config.takeProfitR;
            const riskDollars = equity * (config.riskPct / 100);
            const qty = Math.floor(riskDollars / stopDist);
            if (qty > 0 && entryPrice * qty <= equity) {
              open = {
                entryTime: next.time,
                entryPrice,
                qty,
                side,
                stop,
                takeProfit,
                initialRisk: stopDist * qty,
                entryBarIdx: i + 1,
              };
            }
          }
        }
      }
    }

    const direction = open ? (open.side === "long" ? 1 : -1) : 0;
    const mtm = open ? (bar.close - open.entryPrice) * open.qty * direction : 0;
    equityCurve.push({ time: bar.time, equity: equity + mtm });
  }

  if (open && candles.length > 0) {
    const last = candles[candles.length - 1]!;
    const slipSign = open.side === "long" ? -1 : 1;
    const exitPrice = last.close * (1 + slipSign * bps(config.slippageBps));
    const trade = closeTrade(
      open,
      last.time,
      exitPrice,
      config,
      "endOfData",
      candles.length - 1 - open.entryBarIdx,
    );
    trades.push(trade);
    equity += trade.pnl;
    if (equityCurve.length > 0) {
      equityCurve[equityCurve.length - 1] = { time: last.time, equity };
    }
    open = null;
  }

  const finalEquity = equity;
  const totalReturn = ((finalEquity - initialEquity) / initialEquity) * 100;

  let totalDays = 0;
  let cagr = 0;
  if (candles.length > 1) {
    const first = candles[0]!;
    const last = candles[candles.length - 1]!;
    totalDays = Math.max(1, (last.time - first.time) / 86_400);
    const years = totalDays / 365.25;
    if (years > 0 && finalEquity > 0) {
      cagr = (Math.pow(finalEquity / initialEquity, 1 / years) - 1) * 100;
    }
  }

  let maxDrawdown = 0;
  let peak = initialEquity;
  for (const p of equityCurve) {
    if (p.equity > peak) peak = p.equity;
    if (peak > 0) {
      const dd = (peak - p.equity) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }
  maxDrawdown *= 100;

  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.length - winningTrades;
  const longTrades = trades.filter((t) => t.side === "long").length;
  const shortTrades = trades.length - longTrades;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const avgRMultiple =
    trades.length > 0 ? trades.reduce((s, t) => s + t.rMultiple, 0) / trades.length : 0;
  const avgTradePct =
    trades.length > 0 ? trades.reduce((s, t) => s + t.pnlPct, 0) / trades.length : 0;

  const barsPerYear =
    equityCurve.length > 1 && totalDays > 0
      ? equityCurve.length / (totalDays / 365.25)
      : 252;

  let sharpe = 0;
  if (equityCurve.length > 2) {
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1]!.equity;
      const curr = equityCurve[i]!.equity;
      if (prev > 0) returns.push((curr - prev) / prev);
    }
    if (returns.length > 1) {
      const mean = returns.reduce((s, x) => s + x, 0) / returns.length;
      const variance =
        returns.reduce((s, x) => s + (x - mean) ** 2, 0) / (returns.length - 1);
      const stdev = Math.sqrt(variance);
      if (stdev > 0) sharpe = (mean / stdev) * Math.sqrt(barsPerYear);
    }
  }

  const benchmarkCurve: EquityPoint[] = [];
  let benchmarkTotalReturn = 0;
  let benchmarkCagr = 0;
  const benchStartBar = candles[warmupStart];
  if (benchStartBar && benchStartBar.close > 0) {
    const baseClose = benchStartBar.close;
    for (let i = warmupStart; i < candles.length; i++) {
      const c = candles[i]!;
      benchmarkCurve.push({
        time: c.time,
        equity: initialEquity * (c.close / baseClose),
      });
    }
    const lastBench = benchmarkCurve.at(-1)?.equity ?? initialEquity;
    benchmarkTotalReturn = ((lastBench - initialEquity) / initialEquity) * 100;
    if (totalDays > 0) {
      const years = totalDays / 365.25;
      if (years > 0 && lastBench > 0) {
        benchmarkCagr = (Math.pow(lastBench / initialEquity, 1 / years) - 1) * 100;
      }
    }
  }

  return {
    config,
    trades,
    equityCurve,
    benchmarkCurve,
    metrics: {
      totalReturn,
      cagr,
      maxDrawdown,
      winRate,
      avgRMultiple,
      avgTradePct,
      tradeCount: trades.length,
      winningTrades,
      losingTrades,
      longTrades,
      shortTrades,
      sharpe,
      totalDays,
      finalEquity,
      benchmarkTotalReturn,
      benchmarkCagr,
    },
  };
}

// ---------------------------------------------------------------------------
// Parameter sweeps
// ---------------------------------------------------------------------------

export type SweepParam = "stopAtrMult" | "takeProfitR" | "riskPct";

export const SWEEP_PARAM_LABELS: Record<SweepParam, string> = {
  stopAtrMult: "Stop × ATR",
  takeProfitR: "Take profit (R)",
  riskPct: "Risk per trade (%)",
};

export type SweepAxis = { param: SweepParam; values: number[] };

export type SweepCell = {
  config: BacktestConfig;
  metrics: BacktestMetrics;
  trades: number;
};

export type SweepResult = {
  xAxis: SweepAxis;
  yAxis: SweepAxis;
  grid: SweepCell[][]; // grid[yIdx][xIdx]
};

export function generateSweepValues(min: number, max: number, step: number): number[] {
  if (!(Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(step))) return [];
  if (step <= 0 || max < min) return [];
  const values: number[] = [];
  const precision = Math.max(0, -Math.floor(Math.log10(step)));
  for (let v = min; v <= max + 1e-9; v += step) {
    values.push(Number(v.toFixed(precision + 2)));
    if (values.length > 50) break;
  }
  return values;
}

export function runSweep(
  candles: Candle[],
  results: AnalyzeResult[],
  strategyKind: BacktestStrategy,
  baseConfig: BacktestConfig,
  xAxis: SweepAxis,
  yAxis: SweepAxis,
  lang: Lang = "en",
): SweepResult {
  const grid: SweepCell[][] = [];
  for (const yVal of yAxis.values) {
    const row: SweepCell[] = [];
    for (const xVal of xAxis.values) {
      const config: BacktestConfig = {
        ...baseConfig,
        [xAxis.param]: xVal,
        [yAxis.param]: yVal,
      };
      const r = runBacktest(candles, results, strategyKind, config, lang);
      row.push({ config, metrics: r.metrics, trades: r.trades.length });
    }
    grid.push(row);
  }
  return { xAxis, yAxis, grid };
}

// ---------------------------------------------------------------------------
// Multi-asset portfolio
// ---------------------------------------------------------------------------

export type PortfolioLeg = {
  symbol: string;
  weight: number;
  capital: number;
  result: BacktestResult;
};

export type PortfolioResult = {
  config: BacktestConfig;
  legs: PortfolioLeg[];
  equityCurve: EquityPoint[];
  benchmarkCurve: EquityPoint[];
  metrics: BacktestMetrics;
};

export function runPortfolio(
  symbols: string[],
  dataBySymbol: Record<string, { candles: Candle[]; results: AnalyzeResult[] }>,
  strategyKind: BacktestStrategy,
  baseConfig: BacktestConfig,
  lang: Lang = "en",
  weights?: Record<string, number>,
): PortfolioResult {
  const n = symbols.length;
  if (n === 0) {
    const zero: BacktestMetrics = {
      totalReturn: 0, cagr: 0, maxDrawdown: 0, winRate: 0,
      avgRMultiple: 0, avgTradePct: 0, tradeCount: 0,
      winningTrades: 0, losingTrades: 0, longTrades: 0, shortTrades: 0,
      sharpe: 0, totalDays: 0, finalEquity: baseConfig.initialCapital,
      benchmarkTotalReturn: 0, benchmarkCagr: 0,
    };
    return {
      config: baseConfig,
      legs: [],
      equityCurve: [],
      benchmarkCurve: [],
      metrics: zero,
    };
  }

  // Build normalized weights per symbol. Fallback: equal weight when not provided or all zero.
  const rawWeights = symbols.map((s) => {
    const w = weights?.[s];
    return typeof w === "number" && Number.isFinite(w) && w > 0 ? w : 0;
  });
  const totalRaw = rawWeights.reduce((s, w) => s + w, 0);
  const normalized =
    totalRaw > 0 ? rawWeights.map((w) => w / totalRaw) : symbols.map(() => 1 / n);

  const legs: PortfolioLeg[] = [];
  const legCapitalBySymbol = new Map<string, number>();
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i]!;
    const data = dataBySymbol[sym];
    if (!data) continue;
    const weight = normalized[i]!;
    const legCapital = baseConfig.initialCapital * weight;
    legCapitalBySymbol.set(sym, legCapital);
    const legConfig: BacktestConfig = { ...baseConfig, initialCapital: legCapital };
    const result = runBacktest(data.candles, data.results, strategyKind, legConfig, lang);
    legs.push({ symbol: sym, weight, capital: legCapital, result });
  }

  // Union of timestamps across all legs, then sum last-known equity per leg.
  const timestamps = new Set<number>();
  for (const leg of legs) {
    for (const p of leg.result.equityCurve) timestamps.add(p.time);
  }
  const sortedTimes = [...timestamps].sort((a, b) => a - b);

  function lastAtOrBefore(curve: EquityPoint[], t: number, fallback: number): number {
    let lo = 0;
    let hi = curve.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (curve[mid]!.time <= t) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best >= 0 ? curve[best]!.equity : fallback;
  }

  const equityCurve: EquityPoint[] = sortedTimes.map((time) => {
    let total = 0;
    for (const leg of legs) {
      total += lastAtOrBefore(leg.result.equityCurve, time, leg.capital);
    }
    return { time, equity: total };
  });

  const benchmarkCurve: EquityPoint[] = sortedTimes.map((time) => {
    let total = 0;
    for (const leg of legs) {
      total += lastAtOrBefore(leg.result.benchmarkCurve, time, leg.capital);
    }
    return { time, equity: total };
  });

  const initialEquity = baseConfig.initialCapital;
  const finalEquity = equityCurve.at(-1)?.equity ?? initialEquity;
  const totalReturn = ((finalEquity - initialEquity) / initialEquity) * 100;

  let totalDays = 0;
  let cagr = 0;
  if (sortedTimes.length > 1) {
    totalDays = Math.max(1, (sortedTimes.at(-1)! - sortedTimes[0]!) / 86_400);
    const years = totalDays / 365.25;
    if (years > 0 && finalEquity > 0) {
      cagr = (Math.pow(finalEquity / initialEquity, 1 / years) - 1) * 100;
    }
  }

  let maxDrawdown = 0;
  let peak = initialEquity;
  for (const p of equityCurve) {
    if (p.equity > peak) peak = p.equity;
    if (peak > 0) {
      const dd = (peak - p.equity) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }
  maxDrawdown *= 100;

  const barsPerYear =
    equityCurve.length > 1 && totalDays > 0
      ? equityCurve.length / (totalDays / 365.25)
      : 252;

  let sharpe = 0;
  if (equityCurve.length > 2) {
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const prev = equityCurve[i - 1]!.equity;
      const curr = equityCurve[i]!.equity;
      if (prev > 0) returns.push((curr - prev) / prev);
    }
    if (returns.length > 1) {
      const mean = returns.reduce((s, x) => s + x, 0) / returns.length;
      const variance =
        returns.reduce((s, x) => s + (x - mean) ** 2, 0) / (returns.length - 1);
      const stdev = Math.sqrt(variance);
      if (stdev > 0) sharpe = (mean / stdev) * Math.sqrt(barsPerYear);
    }
  }

  const allTrades = legs.flatMap((l) => l.result.trades);
  const winningTrades = allTrades.filter((t) => t.pnl > 0).length;
  const losingTrades = allTrades.length - winningTrades;
  const longTrades = allTrades.filter((t) => t.side === "long").length;
  const shortTrades = allTrades.length - longTrades;
  const winRate = allTrades.length > 0 ? (winningTrades / allTrades.length) * 100 : 0;
  const avgRMultiple =
    allTrades.length > 0 ? allTrades.reduce((s, t) => s + t.rMultiple, 0) / allTrades.length : 0;
  const avgTradePct =
    allTrades.length > 0 ? allTrades.reduce((s, t) => s + t.pnlPct, 0) / allTrades.length : 0;

  const benchFinal = benchmarkCurve.at(-1)?.equity ?? initialEquity;
  const benchmarkTotalReturn = ((benchFinal - initialEquity) / initialEquity) * 100;
  let benchmarkCagr = 0;
  if (totalDays > 0) {
    const years = totalDays / 365.25;
    if (years > 0 && benchFinal > 0) {
      benchmarkCagr = (Math.pow(benchFinal / initialEquity, 1 / years) - 1) * 100;
    }
  }

  return {
    config: baseConfig,
    legs,
    equityCurve,
    benchmarkCurve,
    metrics: {
      totalReturn,
      cagr,
      maxDrawdown,
      winRate,
      avgRMultiple,
      avgTradePct,
      tradeCount: allTrades.length,
      winningTrades,
      losingTrades,
      longTrades,
      shortTrades,
      sharpe,
      totalDays,
      finalEquity,
      benchmarkTotalReturn,
      benchmarkCagr,
    },
  };
}
