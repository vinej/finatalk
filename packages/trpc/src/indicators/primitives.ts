import { ADX, BollingerBands, EMA, MACD, RSI, SMA } from "trading-signals";
import type { Candle } from "../lib/market-provider";

export type LinePoint = { time: number; value: number };
export type BandPoint = { time: number; upper: number; middle: number; lower: number };
export type MacdPoint = { time: number; macd: number; signal: number; histogram: number };
export type AdxPoint = { time: number; adx: number; pdi: number; mdi: number };

export function rsiSeries(candles: Candle[], period: number): LinePoint[] {
  const ind = new RSI(period);
  const out: LinePoint[] = [];
  for (const c of candles) {
    const v = ind.update(c.close, false);
    if (v != null) out.push({ time: c.time, value: Number(v) });
  }
  return out;
}

export function adxSeries(candles: Candle[], period: number): AdxPoint[] {
  const ind = new ADX(period);
  const out: AdxPoint[] = [];
  for (const c of candles) {
    const v = ind.update({ high: c.high, low: c.low, close: c.close }, false);
    if (v != null) {
      const pdi = typeof ind.pdi === "number" ? ind.pdi : 0;
      const mdi = typeof ind.mdi === "number" ? ind.mdi : 0;
      out.push({ time: c.time, adx: Number(v), pdi, mdi });
    }
  }
  return out;
}

export function bollingerSeries(
  candles: Candle[],
  period: number,
  stdDev: number,
): BandPoint[] {
  const bb = new BollingerBands(period, stdDev);
  const out: BandPoint[] = [];
  for (const c of candles) {
    const v = bb.update(c.close, false);
    if (v != null) out.push({ time: c.time, upper: v.upper, middle: v.middle, lower: v.lower });
  }
  return out;
}

export function macdSeries(
  candles: Candle[],
  fast: number,
  slow: number,
  signal: number,
): MacdPoint[] {
  const macd = new MACD(new EMA(fast), new EMA(slow), new EMA(signal));
  const out: MacdPoint[] = [];
  for (const c of candles) {
    const v = macd.update(c.close, false);
    if (v != null) {
      out.push({
        time: c.time,
        macd: Number(v.macd),
        signal: Number(v.signal),
        histogram: Number(v.histogram),
      });
    }
  }
  return out;
}

export function lastValue<T extends { time: number }, K extends keyof T>(
  series: T[],
  key: K,
): T[K] | null {
  return series.length > 0 ? series[series.length - 1]![key] : null;
}

export function maCrossEvents(
  candles: Candle[],
  fast: number,
  slow: number,
  maType: "sma" | "ema" = "sma",
): { idx: number; time: number; direction: "bull" | "bear" }[] {
  const make = (p: number) => (maType === "ema" ? new EMA(p) : new SMA(p));
  const fastMa = make(fast);
  const slowMa = make(slow);
  const events: { idx: number; time: number; direction: "bull" | "bear" }[] = [];
  let prevDiff: number | null = null;
  let idx = 0;
  for (const c of candles) {
    const f = fastMa.update(c.close, false);
    const s = slowMa.update(c.close, false);
    if (f != null && s != null) {
      const diff = Number(f) - Number(s);
      if (prevDiff != null && prevDiff !== 0 && diff !== 0) {
        if (prevDiff < 0 && diff > 0) events.push({ idx, time: c.time, direction: "bull" });
        else if (prevDiff > 0 && diff < 0) events.push({ idx, time: c.time, direction: "bear" });
      }
      prevDiff = diff;
    }
    idx++;
  }
  return events;
}

export function macdCrossEvents(
  series: MacdPoint[],
): { idx: number; time: number; direction: "bull" | "bear" }[] {
  const events: { idx: number; time: number; direction: "bull" | "bear" }[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1]!.histogram;
    const cur = series[i]!.histogram;
    if (prev < 0 && cur > 0) events.push({ idx: i, time: series[i]!.time, direction: "bull" });
    else if (prev > 0 && cur < 0) events.push({ idx: i, time: series[i]!.time, direction: "bear" });
  }
  return events;
}
