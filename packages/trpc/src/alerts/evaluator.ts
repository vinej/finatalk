/**
 * @fileoverview Price/indicator alert evaluator (server-resident loop).
 *
 * Runs every TICK_INTERVAL_MS (5 min). Each tick:
 *   1. Loads enabled alerts whose cooldown (COOLDOWN_MS = 6h) has elapsed.
 *   2. Groups them by symbol — one chart fetch per symbol per tick, not one
 *      per alert.
 *   3. Evaluates each row's condition against the freshly fetched candles.
 *   4. On a hit: inserts a row into `notification` and stamps `triggeredAt`.
 *
 * Re-entrancy: a `running` flag drops a tick if the previous one is still in
 * flight, so a slow market provider can't pile up overlapping evaluations.
 *
 * Because this is `setInterval`-based and stateful, the host must stay
 * running — Fly's `min_machines_running = 1` guarantees that.
 *
 * Adding a condition: extend `AlertConditionType` (../constants/alerts.ts),
 * then add branches to `evaluateCondition`, `currentThresholdValue`, and
 * `conditionLabel` below.
 *
 * See ARCHITECTURE.md §12 for full details.
 */
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, alert, notification } from "@finatalk/db";
import { fetchCandlesWithCurrency } from "../routers/market";
import type { Candle } from "../lib/market-provider";
import type { AlertConditionType, AlertIndicatorParams } from "../constants/alerts";
import {
  adxSeries,
  bollingerSeries,
  lastValue,
  macdCrossEvents,
  macdSeries,
  maCrossEvents,
  rsiSeries,
} from "../indicators/primitives";

const COOLDOWN_MS = 6 * 60 * 60 * 1000;
const TICK_INTERVAL_MS = 5 * 60 * 1000;

type AlertRow = typeof alert.$inferSelect;

function latestRsi(candles: Candle[], period: number): number | null {
  return lastValue(rsiSeries(candles, period), "value");
}

function latestAdx(candles: Candle[], period: number): number | null {
  return lastValue(adxSeries(candles, period), "adx");
}

function latestBollinger(
  candles: Candle[],
  period: number,
  stdDev: number,
): { upper: number; lower: number; middle: number } | null {
  const series = bollingerSeries(candles, period, stdDev);
  const last = series[series.length - 1];
  return last ? { upper: last.upper, lower: last.lower, middle: last.middle } : null;
}

function crossedRecently(
  candles: Candle[],
  fast: number,
  slow: number,
  direction: "bull" | "bear",
  lookbackBars: number,
): boolean {
  const events = maCrossEvents(candles, fast, slow, "sma");
  const total = candles.length;
  return events.some((e) => e.direction === direction && total - e.idx <= lookbackBars);
}

function macdCrossedRecently(
  candles: Candle[],
  fast: number,
  slow: number,
  signal: number,
  direction: "bull" | "bear",
  lookbackBars: number,
): boolean {
  const series = macdSeries(candles, fast, slow, signal);
  const events = macdCrossEvents(series);
  return events.some((e) => e.direction === direction && series.length - e.idx <= lookbackBars);
}

function nDayHigh(candles: Candle[], lookback: number): number | null {
  if (candles.length < lookback + 1) return null;
  const slice = candles.slice(-lookback - 1, -1);
  let max = -Infinity;
  for (const c of slice) if (c.high > max) max = c.high;
  return Number.isFinite(max) ? max : null;
}

function nDayLow(candles: Candle[], lookback: number): number | null {
  if (candles.length < lookback + 1) return null;
  const slice = candles.slice(-lookback - 1, -1);
  let min = Infinity;
  for (const c of slice) if (c.low < min) min = c.low;
  return Number.isFinite(min) ? min : null;
}

function drawdownFromHigh(candles: Candle[], lookback: number): number | null {
  if (candles.length === 0) return null;
  const slice = candles.slice(-lookback);
  let peak = -Infinity;
  for (const c of slice) if (c.close > peak) peak = c.close;
  if (!Number.isFinite(peak) || peak <= 0) return null;
  const last = candles[candles.length - 1]!.close;
  return ((peak - last) / peak) * 100;
}

function volumeRatio(candles: Candle[], period: number): number | null {
  if (candles.length < period + 1) return null;
  const slice = candles.slice(-period - 1, -1);
  let sum = 0;
  for (const c of slice) sum += c.volume;
  const avg = sum / slice.length;
  if (avg <= 0) return null;
  const lastVol = candles[candles.length - 1]!.volume;
  return lastVol / avg;
}

export function currentThresholdValue(
  conditionType: AlertConditionType,
  candles: Candle[],
  params: AlertIndicatorParams | null,
): number | null {
  if (candles.length === 0) return null;
  const last = candles[candles.length - 1]!;
  const prev = candles.length > 1 ? candles[candles.length - 2]! : null;
  switch (conditionType) {
    case "price_above":
    case "price_below":
      return last.close;
    case "pct_change_24h_up":
    case "pct_change_24h_down": {
      if (!prev || prev.close <= 0) return null;
      return Math.abs(((last.close - prev.close) / prev.close) * 100);
    }
    case "ma_cross_up":
    case "ma_cross_down":
    case "macd_cross_up":
    case "macd_cross_down":
      return last.close;
    case "rsi_above":
    case "rsi_below":
      return latestRsi(candles, params?.period ?? 14);
    case "adx_above":
      return latestAdx(candles, params?.period ?? 14);
    case "bb_upper_break":
      return latestBollinger(candles, params?.period ?? 20, params?.stdDev ?? 2)?.upper ?? null;
    case "bb_lower_break":
      return latestBollinger(candles, params?.period ?? 20, params?.stdDev ?? 2)?.lower ?? null;
    case "breakout_high":
      return nDayHigh(candles, params?.lookback ?? 20);
    case "breakout_low":
      return nDayLow(candles, params?.lookback ?? 20);
    case "drawdown_from_high": {
      const dd = drawdownFromHigh(candles, params?.lookback ?? 252);
      return dd == null ? null : Math.max(0, dd);
    }
    case "volume_spike":
      return volumeRatio(candles, params?.period ?? 20);
    default:
      return null;
  }
}

function evaluateCondition(
  row: AlertRow,
  candles: Candle[],
): { triggered: boolean; value: number | null } {
  if (candles.length === 0) return { triggered: false, value: null };
  const last = candles[candles.length - 1]!;
  const prev = candles.length > 1 ? candles[candles.length - 2]! : null;
  const threshold = Number(row.threshold);
  const params = (row.indicatorParams as AlertIndicatorParams | null) ?? null;
  switch (row.conditionType) {
    case "price_above":
      return { triggered: last.close >= threshold, value: last.close };
    case "price_below":
      return { triggered: last.close <= threshold, value: last.close };
    case "pct_change_24h_up": {
      if (!prev || prev.close <= 0) return { triggered: false, value: null };
      const pct = ((last.close - prev.close) / prev.close) * 100;
      return { triggered: pct >= threshold, value: pct };
    }
    case "pct_change_24h_down": {
      if (!prev || prev.close <= 0) return { triggered: false, value: null };
      const pct = ((last.close - prev.close) / prev.close) * 100;
      return { triggered: pct <= -threshold, value: pct };
    }
    case "ma_cross_up": {
      const fast = params?.fast ?? 50;
      const slow = params?.slow ?? 200;
      return { triggered: crossedRecently(candles, fast, slow, "bull", 3), value: last.close };
    }
    case "ma_cross_down": {
      const fast = params?.fast ?? 50;
      const slow = params?.slow ?? 200;
      return { triggered: crossedRecently(candles, fast, slow, "bear", 3), value: last.close };
    }
    case "rsi_above": {
      const v = latestRsi(candles, params?.period ?? 14);
      if (v == null) return { triggered: false, value: null };
      return { triggered: v >= threshold, value: v };
    }
    case "rsi_below": {
      const v = latestRsi(candles, params?.period ?? 14);
      if (v == null) return { triggered: false, value: null };
      return { triggered: v <= threshold, value: v };
    }
    case "breakout_high": {
      const high = nDayHigh(candles, params?.lookback ?? 20);
      if (high == null) return { triggered: false, value: null };
      return { triggered: last.close >= high, value: last.close };
    }
    case "breakout_low": {
      const low = nDayLow(candles, params?.lookback ?? 20);
      if (low == null) return { triggered: false, value: null };
      return { triggered: last.close <= low, value: last.close };
    }
    case "bb_upper_break": {
      const bb = latestBollinger(candles, params?.period ?? 20, params?.stdDev ?? 2);
      if (bb == null) return { triggered: false, value: null };
      return { triggered: last.close >= bb.upper, value: last.close };
    }
    case "bb_lower_break": {
      const bb = latestBollinger(candles, params?.period ?? 20, params?.stdDev ?? 2);
      if (bb == null) return { triggered: false, value: null };
      return { triggered: last.close <= bb.lower, value: last.close };
    }
    case "macd_cross_up": {
      const fast = params?.fast ?? 12;
      const slow = params?.slow ?? 26;
      const signal = params?.signal ?? 9;
      return { triggered: macdCrossedRecently(candles, fast, slow, signal, "bull", 3), value: last.close };
    }
    case "macd_cross_down": {
      const fast = params?.fast ?? 12;
      const slow = params?.slow ?? 26;
      const signal = params?.signal ?? 9;
      return { triggered: macdCrossedRecently(candles, fast, slow, signal, "bear", 3), value: last.close };
    }
    case "adx_above": {
      const v = latestAdx(candles, params?.period ?? 14);
      if (v == null) return { triggered: false, value: null };
      return { triggered: v >= threshold, value: v };
    }
    case "drawdown_from_high": {
      const dd = drawdownFromHigh(candles, params?.lookback ?? 252);
      if (dd == null) return { triggered: false, value: null };
      return { triggered: dd >= threshold, value: dd };
    }
    case "volume_spike": {
      const ratio = volumeRatio(candles, params?.period ?? 20);
      if (ratio == null) return { triggered: false, value: null };
      const mult = threshold > 0 ? threshold : 2;
      return { triggered: ratio >= mult, value: ratio };
    }
    default:
      return { triggered: false, value: null };
  }
}

function conditionLabel(row: AlertRow, value: number | null): { title: string; body: string } {
  const thr = Number(row.threshold);
  const params = (row.indicatorParams as AlertIndicatorParams | null) ?? null;
  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  switch (row.conditionType) {
    case "price_above":
      return { title: `${row.symbol} crossed above ${fmt(thr)}`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "price_below":
      return { title: `${row.symbol} crossed below ${fmt(thr)}`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "pct_change_24h_up":
      return { title: `${row.symbol} up ${fmt(thr)}% today`, body: value != null ? `Change: ${fmt(value)}%` : "" };
    case "pct_change_24h_down":
      return { title: `${row.symbol} down ${fmt(thr)}% today`, body: value != null ? `Change: ${fmt(value)}%` : "" };
    case "ma_cross_up":
      return { title: `${row.symbol} MA ${params?.fast ?? 50}/${params?.slow ?? 200} bullish cross`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "ma_cross_down":
      return { title: `${row.symbol} MA ${params?.fast ?? 50}/${params?.slow ?? 200} bearish cross`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "rsi_above":
      return { title: `${row.symbol} RSI(${params?.period ?? 14}) above ${fmt(thr)}`, body: value != null ? `RSI: ${fmt(value)}` : "" };
    case "rsi_below":
      return { title: `${row.symbol} RSI(${params?.period ?? 14}) below ${fmt(thr)}`, body: value != null ? `RSI: ${fmt(value)}` : "" };
    case "breakout_high":
      return { title: `${row.symbol} broke ${params?.lookback ?? 20}-day high`, body: value != null ? `Close: ${fmt(value)}` : "" };
    case "breakout_low":
      return { title: `${row.symbol} broke ${params?.lookback ?? 20}-day low`, body: value != null ? `Close: ${fmt(value)}` : "" };
    case "bb_upper_break":
      return { title: `${row.symbol} closed above upper Bollinger (${params?.period ?? 20}, ${params?.stdDev ?? 2}σ)`, body: value != null ? `Close: ${fmt(value)}` : "" };
    case "bb_lower_break":
      return { title: `${row.symbol} closed below lower Bollinger (${params?.period ?? 20}, ${params?.stdDev ?? 2}σ)`, body: value != null ? `Close: ${fmt(value)}` : "" };
    case "macd_cross_up":
      return { title: `${row.symbol} MACD bullish cross (${params?.fast ?? 12}/${params?.slow ?? 26}/${params?.signal ?? 9})`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "macd_cross_down":
      return { title: `${row.symbol} MACD bearish cross (${params?.fast ?? 12}/${params?.slow ?? 26}/${params?.signal ?? 9})`, body: value != null ? `Price: ${fmt(value)}` : "" };
    case "adx_above":
      return { title: `${row.symbol} ADX(${params?.period ?? 14}) above ${fmt(thr)}`, body: value != null ? `ADX: ${fmt(value)}` : "" };
    case "drawdown_from_high":
      return { title: `${row.symbol} drawdown ≥ ${fmt(thr)}%`, body: value != null ? `Drawdown: ${fmt(value)}% (from ${params?.lookback ?? 252}-day high)` : "" };
    case "volume_spike":
      return { title: `${row.symbol} volume spike ≥ ${fmt(thr)}×`, body: value != null ? `Volume ratio: ${fmt(value)}×` : "" };
    default:
      return { title: `${row.symbol} alert triggered`, body: "" };
  }
}

export async function evaluateAlertsOnce(): Promise<{ evaluated: number; triggered: number }> {
  const rows = await db.select().from(alert).where(eq(alert.enabled, true));
  if (rows.length === 0) return { evaluated: 0, triggered: 0 };
  const now = Date.now();
  const eligible = rows.filter(
    (r) => !r.triggeredAt || now - r.triggeredAt.getTime() > COOLDOWN_MS,
  );
  if (eligible.length === 0) return { evaluated: 0, triggered: 0 };

  const bySymbol = new Map<string, AlertRow[]>();
  for (const r of eligible) {
    const list = bySymbol.get(r.symbol) ?? [];
    list.push(r);
    bySymbol.set(r.symbol, list);
  }

  let triggered = 0;
  for (const [symbol, group] of bySymbol) {
    let candles: Candle[];
    try {
      const res = await fetchCandlesWithCurrency(symbol, "1y", "1d", null);
      candles = res.candles;
    } catch {
      continue;
    }
    for (const row of group) {
      const { triggered: hit, value } = evaluateCondition(row, candles);
      if (!hit) continue;
      const { title, body } = conditionLabel(row, value);
      await db.insert(notification).values({
        id: randomUUID(),
        userId: row.userId,
        type: "alert",
        title,
        body: body || null,
        link: `/dashboard/analysis?symbol=${encodeURIComponent(row.symbol)}`,
        metadata: {
          alertId: row.id,
          symbol: row.symbol,
          conditionType: row.conditionType,
          threshold: Number(row.threshold),
          value,
        },
      });
      await db.update(alert).set({ triggeredAt: new Date() }).where(eq(alert.id, row.id));
      triggered++;
    }
  }
  return { evaluated: eligible.length, triggered };
}

export function startAlertEvaluator(
  onError: (err: unknown) => void = (err) => console.error("[alerts] evaluator failed", err),
): () => void {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await evaluateAlertsOnce();
    } catch (err) {
      onError(err);
    } finally {
      running = false;
    }
  };
  void run();
  const handle = setInterval(() => void run(), TICK_INTERVAL_MS);
  return () => clearInterval(handle);
}
