import { describe, expect, it } from "vitest";
import {
  type BacktestAnalyzeResult,
  type BacktestCandle,
  DEFAULT_BACKTEST_CONFIG,
  generateSweepValues,
  runBacktest,
} from "@/lib/backtest-engine";

const DAY = 86_400;

function makeCandles(count: number, startPrice: number, endPrice: number): BacktestCandle[] {
  const candles: BacktestCandle[] = [];
  const step = (endPrice - startPrice) / Math.max(1, count - 1);
  for (let i = 0; i < count; i++) {
    const close = startPrice + step * i;
    const open = i === 0 ? close : startPrice + step * (i - 1);
    candles.push({
      time: i * DAY,
      open,
      high: Math.max(open, close),
      low: Math.min(open, close),
      close,
      volume: 1_000_000,
    });
  }
  return candles;
}

function makeAtrResult(candles: BacktestCandle[], value: number): BacktestAnalyzeResult {
  return {
    kind: "atr",
    spec: { kind: "atr", period: 14 },
    series: candles.map((c) => ({ time: c.time, value })),
  } as unknown as BacktestAnalyzeResult;
}

describe("generateSweepValues", () => {
  it("produces evenly-spaced values inclusive of bounds", () => {
    expect(generateSweepValues(1, 3, 0.5)).toEqual([1, 1.5, 2, 2.5, 3]);
  });

  it("returns an empty array when step is zero or non-finite", () => {
    expect(generateSweepValues(1, 3, 0)).toEqual([]);
    expect(generateSweepValues(1, 3, Number.NaN)).toEqual([]);
    expect(generateSweepValues(1, 3, Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it("returns an empty array when max is less than min", () => {
    expect(generateSweepValues(5, 1, 1)).toEqual([]);
  });

  it("returns a single value when min equals max", () => {
    expect(generateSweepValues(2, 2, 0.5)).toEqual([2]);
  });

  it("caps the result to prevent runaway sweeps", () => {
    // Implementation breaks once length exceeds 50, so the ceiling is 51 entries.
    expect(generateSweepValues(0, 1000, 0.01).length).toBeLessThanOrEqual(51);
  });

  it("rounds to a sensible precision derived from the step size", () => {
    const vs = generateSweepValues(0, 1, 0.1);
    for (const v of vs) {
      expect(Number(v.toFixed(3))).toBe(Number(v.toFixed(6)));
    }
    expect(vs).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  });
});

describe("runBacktest", () => {
  it("returns zero trades and flat equity when the strategy cannot evaluate", () => {
    // trendPullback requires EMA+RSI; providing only ATR forces every bar to 'wait'.
    const candles = makeCandles(60, 100, 120);
    const results = [makeAtrResult(candles, 2)];
    const r = runBacktest(candles, results, "trendPullback", DEFAULT_BACKTEST_CONFIG);
    expect(r.trades).toHaveLength(0);
    expect(r.metrics.tradeCount).toBe(0);
    expect(r.metrics.winRate).toBe(0);
    expect(r.metrics.totalReturn).toBe(0);
    expect(r.metrics.finalEquity).toBe(DEFAULT_BACKTEST_CONFIG.initialCapital);
  });

  it("computes a buy-and-hold benchmark that matches the price ratio", () => {
    const candles = makeCandles(60, 100, 200);
    const results = [makeAtrResult(candles, 2)];
    const r = runBacktest(candles, results, "trendPullback", DEFAULT_BACKTEST_CONFIG);
    // Last bench equity / initial should ≈ last close / first close = 2.
    const lastBench = r.benchmarkCurve.at(-1)?.equity ?? 0;
    expect(lastBench / DEFAULT_BACKTEST_CONFIG.initialCapital).toBeCloseTo(2, 3);
    expect(r.metrics.benchmarkTotalReturn).toBeCloseTo(100, 3);
  });

  it("computes CAGR consistent with a multi-year benchmark total return", () => {
    // 3 years of daily bars, doubling in price → benchmark total return ~100%.
    // CAGR = 2^(1/years) - 1 ≈ (2^(1/3) - 1) * 100 ≈ 25.99%.
    const candles = makeCandles(365 * 3 + 1, 50, 100);
    const results = [makeAtrResult(candles, 1)];
    const r = runBacktest(candles, results, "trendPullback", DEFAULT_BACKTEST_CONFIG);
    expect(r.metrics.benchmarkCagr).toBeGreaterThan(24);
    expect(r.metrics.benchmarkCagr).toBeLessThan(28);
    expect(r.metrics.totalDays).toBeGreaterThanOrEqual(365 * 3);
  });

  it("applies fees and slippage to close a losing stop-out on a synthetic buy signal", () => {
    // Hand-craft a price series + indicator fixtures that force trendPullback to
    // emit 'buy' on the first bar, then immediately tank so the stop triggers.
    const candles: BacktestCandle[] = [];
    // 30 bars of flat price, then a drop.
    for (let i = 0; i < 30; i++) {
      candles.push({
        time: i * DAY,
        open: 100,
        high: 100.5,
        low: 99.5,
        close: 100,
        volume: 1_000_000,
      });
    }
    // Drop bar (idx 30) with low below the stop (stop = 100 - 2*ATR = 96).
    candles.push({ time: 30 * DAY, open: 99, high: 99, low: 90, close: 90, volume: 1_000_000 });

    const atr: BacktestAnalyzeResult = {
      kind: "atr",
      spec: { kind: "atr", period: 14 },
      series: candles.map((c) => ({ time: c.time, value: 2 })),
    } as unknown as BacktestAnalyzeResult;

    // EMA below price (uptrend) and RSI in the 40–50 pullback window → buy.
    const ema: BacktestAnalyzeResult = {
      kind: "ema",
      spec: { kind: "ema", period: 50 },
      series: candles.map((c) => ({ time: c.time, value: 95 })),
    } as unknown as BacktestAnalyzeResult;

    const rsi: BacktestAnalyzeResult = {
      kind: "rsi",
      spec: { kind: "rsi", period: 14 },
      series: candles.map((c) => ({ time: c.time, value: 45 })),
    } as unknown as BacktestAnalyzeResult;

    const r = runBacktest(candles, [atr, ema, rsi], "trendPullback", DEFAULT_BACKTEST_CONFIG);

    expect(r.trades.length).toBeGreaterThanOrEqual(1);
    const first = r.trades[0]!;
    expect(first.side).toBe("long");
    expect(first.reason).toBe("stop");
    expect(first.pnl).toBeLessThan(0);
    // Losing trade must drag final equity below the initial capital.
    expect(r.metrics.finalEquity).toBeLessThan(DEFAULT_BACKTEST_CONFIG.initialCapital);
  });
});
