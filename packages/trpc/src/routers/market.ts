import { createRequire } from "node:module";
import { TRPCError } from "@trpc/server";
import {
  ADX,
  ATR,
  BollingerBands,
  DEMA,
  EMA,
  MACD,
  MOM,
  OBV,
  PSAR,
  RMA,
  ROC,
  RSI,
  SMA,
  StochasticOscillator,
  StochasticRSI,
  WMA,
  WilliamsR,
} from "trading-signals";
import { z } from "zod";
import { getOpenBBClient, isOpenBBEnabled, type OHLCVBar } from "@finatalk/openbb";
import { requireOpenBBClient, tryOrNull, tryProviders } from "../lib/openbb-helpers";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  IndicatorSpec,
  IntervalSchema,
  RangeSchema,
  SymbolSchema,
} from "../schemas/indicator";

type IndicatorSpecT = IndicatorSpec;
import {
  fetchChartWithFallback,
  fetchFxRatesWithFallback,
  rangeToPeriod1,
  type Candle,
} from "../lib/market-provider";
import {
  fetchIndexConstituentsFromWikipedia,
  fetchTsxCompositeSymbols,
} from "../lib/wikipedia-constituents";
import { normalizeExchange, type YFQuote } from "../market/exchanges";

// createRequire bypasses TS's synthetic-default-import machinery. yahoo-finance2
// may expose its handle as either the module root (v3 singleton) or a `.default`
// (v2 class) — handle both: unwrap .default if present, then call `new` only
// if it's a class.
const cjsRequire = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yfMod: any = cjsRequire("yahoo-finance2");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yfHandle: any = yfMod?.default ?? yfMod;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf: any = typeof yfHandle === "function" ? new yfHandle() : yfHandle;

function applyFx(candles: Candle[], rates: Map<number, number>): Candle[] {
  const sortedTimes = [...rates.keys()].sort((a, b) => a - b);
  const sortedRates = sortedTimes.map((t) => rates.get(t)!);
  let lastRate: number | null = null;
  const out: Candle[] = [];
  let fxIdx = 0;
  for (const c of candles) {
    while (fxIdx < sortedTimes.length && sortedTimes[fxIdx]! <= c.time) {
      lastRate = sortedRates[fxIdx]!;
      fxIdx++;
    }
    if (lastRate == null) continue;
    out.push({
      time: c.time,
      open: c.open * lastRate,
      high: c.high * lastRate,
      low: c.low * lastRate,
      close: c.close * lastRate,
      volume: c.volume,
      adjClose: c.adjClose != null ? c.adjClose * lastRate : null,
    });
  }
  return out;
}

export type DividendInfo = {
  symbol: string;
  dividendRate: number | null;
  dividendYield: number | null;
  exDividendDate: string | null;
  dividendDate: string | null;
};

export async function fetchDividendInfo(symbol: string): Promise<DividendInfo> {
  const sym = symbol.toUpperCase();
  try {
    const summary = await yf.quoteSummary(sym, {
      modules: ["summaryDetail", "calendarEvents"],
    });
    const sd = summary.summaryDetail;
    const ce = summary.calendarEvents;
    const rate = sd?.dividendRate ?? sd?.trailingAnnualDividendRate ?? null;
    const yld = sd?.dividendYield ?? sd?.trailingAnnualDividendYield ?? sd?.yield ?? null;
    return {
      symbol: sym,
      dividendRate: rate ?? null,
      dividendYield: yld ?? null,
      exDividendDate: sd?.exDividendDate?.toISOString().slice(0, 10) ?? null,
      dividendDate: ce?.dividendDate?.toISOString().slice(0, 10) ?? null,
    };
  } catch {
    return {
      symbol: sym,
      dividendRate: null,
      dividendYield: null,
      exDividendDate: null,
      dividendDate: null,
    };
  }
}

export async function fetchCandlesWithCurrency(
  symbol: string,
  range: z.infer<typeof RangeSchema>,
  interval: z.infer<typeof IntervalSchema>,
  convertTo: string | null,
): Promise<{ candles: Candle[]; nativeCurrency: string; displayCurrency: string }> {
  let data;
  try {
    ({ data } = await fetchChartWithFallback(symbol, range, interval));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch chart";
    if (/no data found|delisted/i.test(msg)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No historical chart data available for ${symbol}. Some mutual funds and indexes expose quotes but not chart history.`,
      });
    }
    throw err;
  }
  const nativeCurrency = data.currency;
  let candles = data.candles;
  if (candles.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No historical chart data available for ${symbol}. Some mutual funds and indexes expose quotes but not chart history.`,
    });
  }
  const target = convertTo ? convertTo.toUpperCase() : null;
  if (!target || target === nativeCurrency) {
    return { candles, nativeCurrency, displayCurrency: nativeCurrency };
  }
  const rates = await fetchFxRatesWithFallback(nativeCurrency, target, range, interval);
  if (rates.size === 0) {
    return { candles, nativeCurrency, displayCurrency: nativeCurrency };
  }
  candles = applyFx(candles, rates);
  return { candles, nativeCurrency, displayCurrency: target };
}

type LineSeries = { time: number; value: number }[];
type MacdSeries = { time: number; macd: number; signal: number; histogram: number }[];
type BandsSeries = { time: number; upper: number; middle: number; lower: number }[];
type StochSeries = { time: number; k: number; d: number }[];
type AdxSeries = { time: number; adx: number; pdi: number; mdi: number }[];
type AroonSeries = { time: number; up: number; down: number }[];
type VortexSeries = { time: number; plus: number; minus: number }[];
type LiqSweepEvent = { time: number; type: "high" | "low"; level: number; wickPrice: number };
type LiqSweepSeries = { events: LiqSweepEvent[] };
type FvgGap = {
  time: number;
  endTime: number | null;
  top: number;
  bottom: number;
  type: "bullish" | "bearish";
  filled: boolean;
  filledTime: number | null;
};
type FvgSeries = { gaps: FvgGap[] };
type SrLevel = {
  price: number;
  type: "support" | "resistance";
  touches: number;
  firstTime: number;
  lastTime: number;
};
type SrLevelsSeries = { startTime: number; endTime: number; levels: SrLevel[] };
type PivotLevel = { label: string; price: number; role: "pp" | "resistance" | "support" };
type PivotPeriod = { startTime: number; endTime: number; levels: PivotLevel[] };
type PivotsSeries = { periods: PivotPeriod[] };
type VolProfileBin = { price: number; volume: number };
type VolProfileSeries = {
  startTime: number;
  endTime: number;
  bins: VolProfileBin[];
  poc: number;
  vah: number;
  val: number;
  binWidth: number;
};
type OrderBlockZone = {
  time: number;
  endTime: number | null;
  top: number;
  bottom: number;
  type: "bullish" | "bearish";
  mitigated: boolean;
  mitigatedTime: number | null;
};
type OrderBlockSeries = { blocks: OrderBlockZone[] };
type CrossEvent = { time: number; direction: "bull" | "bear"; price: number };
type MaCrossSeries = { fast: LineSeries; slow: LineSeries; events: CrossEvent[] };
type MacdCrossSeries = { macd: MacdSeries; events: CrossEvent[] };
type FibSeries = {
  direction: "up" | "down";
  swingHigh: number;
  swingHighTime: number;
  swingLow: number;
  swingLowTime: number;
  levels: { ratio: number; price: number }[];
} | null;

type IndicatorResult =
  | { kind: "sma"; spec: Extract<IndicatorSpecT, { kind: "sma" }>; series: LineSeries }
  | { kind: "ema"; spec: Extract<IndicatorSpecT, { kind: "ema" }>; series: LineSeries }
  | { kind: "rma"; spec: Extract<IndicatorSpecT, { kind: "rma" }>; series: LineSeries }
  | { kind: "wma"; spec: Extract<IndicatorSpecT, { kind: "wma" }>; series: LineSeries }
  | { kind: "dema"; spec: Extract<IndicatorSpecT, { kind: "dema" }>; series: LineSeries }
  | { kind: "rsi"; spec: Extract<IndicatorSpecT, { kind: "rsi" }>; series: LineSeries }
  | { kind: "mom"; spec: Extract<IndicatorSpecT, { kind: "mom" }>; series: LineSeries }
  | { kind: "roc"; spec: Extract<IndicatorSpecT, { kind: "roc" }>; series: LineSeries }
  | { kind: "macd"; spec: Extract<IndicatorSpecT, { kind: "macd" }>; series: MacdSeries }
  | { kind: "bbands"; spec: Extract<IndicatorSpecT, { kind: "bbands" }>; series: BandsSeries }
  | { kind: "atr"; spec: Extract<IndicatorSpecT, { kind: "atr" }>; series: LineSeries }
  | { kind: "adx"; spec: Extract<IndicatorSpecT, { kind: "adx" }>; series: AdxSeries }
  | { kind: "stoch"; spec: Extract<IndicatorSpecT, { kind: "stoch" }>; series: StochSeries }
  | { kind: "stochRsi"; spec: Extract<IndicatorSpecT, { kind: "stochRsi" }>; series: LineSeries }
  | { kind: "williamsR"; spec: Extract<IndicatorSpecT, { kind: "williamsR" }>; series: LineSeries }
  | { kind: "obv"; spec: Extract<IndicatorSpecT, { kind: "obv" }>; series: LineSeries }
  | { kind: "vwap"; spec: Extract<IndicatorSpecT, { kind: "vwap" }>; series: LineSeries }
  | { kind: "fib"; spec: Extract<IndicatorSpecT, { kind: "fib" }>; series: FibSeries }
  | { kind: "psar"; spec: Extract<IndicatorSpecT, { kind: "psar" }>; series: LineSeries }
  | { kind: "maCross"; spec: Extract<IndicatorSpecT, { kind: "maCross" }>; series: MaCrossSeries }
  | { kind: "macdCross"; spec: Extract<IndicatorSpecT, { kind: "macdCross" }>; series: MacdCrossSeries }
  | { kind: "keltner"; spec: Extract<IndicatorSpecT, { kind: "keltner" }>; series: BandsSeries }
  | { kind: "donchian"; spec: Extract<IndicatorSpecT, { kind: "donchian" }>; series: BandsSeries }
  | { kind: "chaikinVol"; spec: Extract<IndicatorSpecT, { kind: "chaikinVol" }>; series: LineSeries }
  | { kind: "ad"; spec: Extract<IndicatorSpecT, { kind: "ad" }>; series: LineSeries }
  | { kind: "cmf"; spec: Extract<IndicatorSpecT, { kind: "cmf" }>; series: LineSeries }
  | { kind: "volOsc"; spec: Extract<IndicatorSpecT, { kind: "volOsc" }>; series: LineSeries }
  | { kind: "aroon"; spec: Extract<IndicatorSpecT, { kind: "aroon" }>; series: AroonSeries }
  | { kind: "vortex"; spec: Extract<IndicatorSpecT, { kind: "vortex" }>; series: VortexSeries }
  | { kind: "tii"; spec: Extract<IndicatorSpecT, { kind: "tii" }>; series: LineSeries }
  | { kind: "zscore"; spec: Extract<IndicatorSpecT, { kind: "zscore" }>; series: LineSeries }
  | { kind: "bbPctB"; spec: Extract<IndicatorSpecT, { kind: "bbPctB" }>; series: LineSeries }
  | { kind: "hurst"; spec: Extract<IndicatorSpecT, { kind: "hurst" }>; series: LineSeries }
  | { kind: "liqSweep"; spec: Extract<IndicatorSpecT, { kind: "liqSweep" }>; series: LiqSweepSeries }
  | { kind: "fvg"; spec: Extract<IndicatorSpecT, { kind: "fvg" }>; series: FvgSeries }
  | { kind: "srLevels"; spec: Extract<IndicatorSpecT, { kind: "srLevels" }>; series: SrLevelsSeries }
  | { kind: "pivots"; spec: Extract<IndicatorSpecT, { kind: "pivots" }>; series: PivotsSeries }
  | { kind: "volProfile"; spec: Extract<IndicatorSpecT, { kind: "volProfile" }>; series: VolProfileSeries }
  | { kind: "orderBlock"; spec: Extract<IndicatorSpecT, { kind: "orderBlock" }>; series: OrderBlockSeries };

export type RunAnalysisInput = {
  symbol: string;
  range: z.infer<typeof RangeSchema>;
  interval: z.infer<typeof IntervalSchema>;
  indicators: IndicatorSpecT[];
  convertTo?: "CAD" | null;
};

export type RunAnalysisOutput = {
  symbol: string;
  candles: Candle[];
  results: IndicatorResult[];
  nativeCurrency: string;
  displayCurrency: string;
};

export function indicatorTail(r: IndicatorResult): {
  last: Record<string, number> | null;
  tail: Array<Record<string, number>>;
  events?: Array<{ time: number; direction: "bull" | "bear"; price: number }>;
} {
  if (r.kind === "maCross") {
    const arr = r.series.fast.map((p, i) => ({
      time: p.time,
      fast: p.value,
      slow: r.series.slow[i]?.value ?? Number.NaN,
    }));
    return {
      last: arr.at(-1) ?? null,
      tail: arr.slice(-5),
      events: r.series.events.slice(-5),
    };
  }
  if (r.kind === "macdCross") {
    return {
      last: r.series.macd.at(-1) ?? null,
      tail: r.series.macd.slice(-5),
      events: r.series.events.slice(-5),
    };
  }
  if (r.kind === "fib") {
    if (r.series == null) return { last: null, tail: [] };
    const s = r.series;
    const last: Record<string, number> = {
      swingHigh: s.swingHigh,
      swingLow: s.swingLow,
      level382: s.levels.find((l) => l.ratio === 0.382)?.price ?? Number.NaN,
      level500: s.levels.find((l) => l.ratio === 0.5)?.price ?? Number.NaN,
      level618: s.levels.find((l) => l.ratio === 0.618)?.price ?? Number.NaN,
    };
    return { last, tail: [last] };
  }
  if (r.kind === "liqSweep") {
    const tail = r.series.events.slice(-5).map((e) => ({
      time: e.time,
      level: e.level,
      wick: e.wickPrice,
      dir: e.type === "high" ? 1 : -1,
    }));
    return { last: tail.at(-1) ?? null, tail };
  }
  if (r.kind === "fvg") {
    const tail = r.series.gaps.slice(-5).map((g) => ({
      time: g.time,
      top: g.top,
      bottom: g.bottom,
      dir: g.type === "bullish" ? 1 : -1,
      filled: g.filled ? 1 : 0,
    }));
    return { last: tail.at(-1) ?? null, tail };
  }
  if (r.kind === "srLevels") {
    const tail = r.series.levels.slice(0, 5).map((l) => ({
      price: l.price,
      touches: l.touches,
      dir: l.type === "support" ? 1 : -1,
    }));
    return { last: tail.at(0) ?? null, tail };
  }
  if (r.kind === "pivots") {
    const last = r.series.periods.at(-1);
    if (!last) return { last: null, tail: [] };
    const obj: Record<string, number> = { time: last.startTime };
    for (const l of last.levels) obj[l.label] = l.price;
    return { last: obj, tail: [obj] };
  }
  if (r.kind === "volProfile") {
    const last: Record<string, number> = {
      poc: r.series.poc,
      vah: r.series.vah,
      val: r.series.val,
    };
    return { last, tail: [last] };
  }
  if (r.kind === "orderBlock") {
    const tail = r.series.blocks.slice(-5).map((b) => ({
      time: b.time,
      top: b.top,
      bottom: b.bottom,
      dir: b.type === "bullish" ? 1 : -1,
      mitigated: b.mitigated ? 1 : 0,
    }));
    return { last: tail.at(-1) ?? null, tail };
  }
  return {
    last: r.series.at(-1) ?? null,
    tail: r.series.slice(-5),
  };
}

export async function runAnalysis(input: RunAnalysisInput): Promise<RunAnalysisOutput> {
  const symbol = input.symbol.toUpperCase();
  const { candles, nativeCurrency, displayCurrency } = await fetchCandlesWithCurrency(
    symbol, input.range, input.interval, input.convertTo ?? null,
  );
  const results = input.indicators.map((spec) => compute(spec, candles));
  return { symbol, candles, results, nativeCurrency, displayCurrency };
}

function compute(spec: IndicatorSpecT, candles: Candle[]): IndicatorResult {
  switch (spec.kind) {
    case "sma":
    case "ema":
    case "rma":
    case "wma":
    case "dema":
    case "rsi":
    case "mom":
    case "roc": {
      const ind =
        spec.kind === "sma" ? new SMA(spec.period)
        : spec.kind === "ema" ? new EMA(spec.period)
        : spec.kind === "rma" ? new RMA(spec.period)
        : spec.kind === "wma" ? new WMA(spec.period)
        : spec.kind === "dema" ? new DEMA(spec.period)
        : spec.kind === "rsi" ? new RSI(spec.period)
        : spec.kind === "mom" ? new MOM(spec.period)
        : new ROC(spec.period);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = ind.update(c.close, false);
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: spec.kind, spec, series } as IndicatorResult;
    }
    case "macd": {
      const macd = new MACD(new EMA(spec.fast), new EMA(spec.slow), new EMA(spec.signal));
      const series: MacdSeries = [];
      for (const c of candles) {
        const v = macd.update(c.close, false);
        if (v != null) series.push({ time: c.time, macd: v.macd, signal: v.signal, histogram: v.histogram });
      }
      return { kind: "macd", spec, series };
    }
    case "bbands": {
      const bb = new BollingerBands(spec.period, spec.stdDev);
      const series: BandsSeries = [];
      for (const c of candles) {
        const v = bb.update(c.close, false);
        if (v != null) series.push({ time: c.time, upper: v.upper, middle: v.middle, lower: v.lower });
      }
      return { kind: "bbands", spec, series };
    }
    case "atr": {
      const atr = new ATR(spec.period);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = atr.update({ high: c.high, low: c.low, close: c.close }, false);
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: "atr", spec, series };
    }
    case "adx": {
      const adx = new ADX(spec.period);
      const series: AdxSeries = [];
      for (const c of candles) {
        const v = adx.update({ high: c.high, low: c.low, close: c.close }, false);
        if (v != null) {
          const pdi = typeof adx.pdi === "number" ? adx.pdi : 0;
          const mdi = typeof adx.mdi === "number" ? adx.mdi : 0;
          series.push({ time: c.time, adx: Number(v), pdi, mdi });
        }
      }
      return { kind: "adx", spec, series };
    }
    case "stoch": {
      const stoch = new StochasticOscillator(spec.period, spec.signal, spec.smooth);
      const series: StochSeries = [];
      for (const c of candles) {
        const v = stoch.update({ high: c.high, low: c.low, close: c.close }, false);
        if (v != null) series.push({ time: c.time, k: v.stochK, d: v.stochD });
      }
      return { kind: "stoch", spec, series };
    }
    case "stochRsi": {
      const sr = new StochasticRSI(spec.period);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = sr.update(c.close, false);
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: "stochRsi", spec, series };
    }
    case "williamsR": {
      const wr = new WilliamsR(spec.period);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = wr.update({ high: c.high, low: c.low, close: c.close }, false);
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: "williamsR", spec, series };
    }
    case "obv": {
      const obv = new OBV(2);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = obv.update(
          { open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume },
          false,
        );
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: "obv", spec, series };
    }
    case "vwap": {
      const series: LineSeries = [];
      let cumPV = 0;
      let cumV = 0;
      for (const c of candles) {
        const typical = (c.high + c.low + c.close) / 3;
        cumPV += typical * c.volume;
        cumV += c.volume;
        if (cumV > 0) series.push({ time: c.time, value: cumPV / cumV });
      }
      return { kind: "vwap", spec, series };
    }
    case "fib": {
      const window =
        spec.lookback != null && spec.lookback < candles.length
          ? candles.slice(-spec.lookback)
          : candles;
      if (window.length < 2) return { kind: "fib", spec, series: null };
      let hi = -Infinity;
      let lo = Infinity;
      let hiT = window[0]!.time;
      let loT = window[0]!.time;
      for (const c of window) {
        if (c.high > hi) { hi = c.high; hiT = c.time; }
        if (c.low < lo) { lo = c.low; loT = c.time; }
      }
      const range = hi - lo;
      if (range <= 0) return { kind: "fib", spec, series: null };
      const direction: "up" | "down" = hiT >= loT ? "up" : "down";
      const ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const levels = ratios.map((r) => ({
        ratio: r,
        price: direction === "up" ? hi - range * r : lo + range * r,
      }));
      return {
        kind: "fib",
        spec,
        series: { direction, swingHigh: hi, swingHighTime: hiT, swingLow: lo, swingLowTime: loT, levels },
      };
    }
    case "psar": {
      const psar = new PSAR({ accelerationStep: spec.step, accelerationMax: spec.max });
      const series: LineSeries = [];
      for (const c of candles) {
        const v = psar.update({ high: c.high, low: c.low }, false);
        if (v != null) series.push({ time: c.time, value: Number(v) });
      }
      return { kind: "psar", spec, series };
    }
    case "maCross": {
      const make = (period: number) =>
        spec.maType === "ema" ? new EMA(period) : new SMA(period);
      const fastMa = make(spec.fastPeriod);
      const slowMa = make(spec.slowPeriod);
      const fast: LineSeries = [];
      const slow: LineSeries = [];
      const events: CrossEvent[] = [];
      let prevDiff: number | null = null;
      for (const c of candles) {
        const f = fastMa.update(c.close, false);
        const s = slowMa.update(c.close, false);
        if (f == null || s == null) continue;
        const fv = Number(f);
        const sv = Number(s);
        fast.push({ time: c.time, value: fv });
        slow.push({ time: c.time, value: sv });
        const diff = fv - sv;
        if (prevDiff != null && prevDiff !== 0 && diff !== 0) {
          if (prevDiff < 0 && diff > 0) {
            events.push({ time: c.time, direction: "bull", price: c.close });
          } else if (prevDiff > 0 && diff < 0) {
            events.push({ time: c.time, direction: "bear", price: c.close });
          }
        }
        prevDiff = diff;
      }
      return { kind: "maCross", spec, series: { fast, slow, events } };
    }
    case "macdCross": {
      const macd = new MACD(new EMA(spec.fast), new EMA(spec.slow), new EMA(spec.signal));
      const series: MacdSeries = [];
      const events: CrossEvent[] = [];
      let prevHist: number | null = null;
      for (const c of candles) {
        const v = macd.update(c.close, false);
        if (v == null) continue;
        const macdN = Number(v.macd);
        const signalN = Number(v.signal);
        const histN = Number(v.histogram);
        series.push({ time: c.time, macd: macdN, signal: signalN, histogram: histN });
        if (prevHist != null && prevHist !== 0 && histN !== 0) {
          if (prevHist < 0 && histN > 0) {
            events.push({ time: c.time, direction: "bull", price: c.close });
          } else if (prevHist > 0 && histN < 0) {
            events.push({ time: c.time, direction: "bear", price: c.close });
          }
        }
        prevHist = histN;
      }
      return { kind: "macdCross", spec, series: { macd: series, events } };
    }
    case "keltner": {
      const ema = new EMA(spec.period);
      const atr = new ATR(spec.atrPeriod);
      const series: BandsSeries = [];
      for (const c of candles) {
        const m = ema.update(c.close, false);
        const a = atr.update({ high: c.high, low: c.low, close: c.close }, false);
        if (m != null && a != null) {
          const mv = Number(m);
          const av = Number(a);
          series.push({
            time: c.time,
            upper: mv + spec.multiplier * av,
            middle: mv,
            lower: mv - spec.multiplier * av,
          });
        }
      }
      return { kind: "keltner", spec, series };
    }
    case "donchian": {
      const series: BandsSeries = [];
      for (let i = spec.period - 1; i < candles.length; i++) {
        let hi = -Infinity;
        let lo = Infinity;
        for (let j = i - spec.period + 1; j <= i; j++) {
          const c = candles[j]!;
          if (c.high > hi) hi = c.high;
          if (c.low < lo) lo = c.low;
        }
        series.push({
          time: candles[i]!.time,
          upper: hi,
          middle: (hi + lo) / 2,
          lower: lo,
        });
      }
      return { kind: "donchian", spec, series };
    }
    case "chaikinVol": {
      const ema = new EMA(spec.emaPeriod);
      const emaValues: Array<{ time: number; value: number } | null> = [];
      for (const c of candles) {
        const v = ema.update(c.high - c.low, false);
        emaValues.push(v != null ? { time: c.time, value: Number(v) } : null);
      }
      const series: LineSeries = [];
      for (let i = 0; i < emaValues.length; i++) {
        const cur = emaValues[i];
        const prev = emaValues[i - spec.rocPeriod];
        if (cur && prev && prev.value !== 0) {
          series.push({
            time: cur.time,
            value: ((cur.value - prev.value) / prev.value) * 100,
          });
        }
      }
      return { kind: "chaikinVol", spec, series };
    }
    case "ad": {
      const series: LineSeries = [];
      let ad = 0;
      for (const c of candles) {
        const range = c.high - c.low;
        const mfv = range > 0 ? (((c.close - c.low) - (c.high - c.close)) / range) * c.volume : 0;
        ad += mfv;
        series.push({ time: c.time, value: ad });
      }
      return { kind: "ad", spec, series };
    }
    case "cmf": {
      const mfv: number[] = [];
      const vols: number[] = [];
      for (const c of candles) {
        const range = c.high - c.low;
        mfv.push(range > 0 ? (((c.close - c.low) - (c.high - c.close)) / range) * c.volume : 0);
        vols.push(c.volume);
      }
      const series: LineSeries = [];
      for (let i = spec.period - 1; i < candles.length; i++) {
        let mfvSum = 0;
        let volSum = 0;
        for (let j = i - spec.period + 1; j <= i; j++) {
          mfvSum += mfv[j]!;
          volSum += vols[j]!;
        }
        if (volSum > 0) {
          series.push({ time: candles[i]!.time, value: mfvSum / volSum });
        }
      }
      return { kind: "cmf", spec, series };
    }
    case "volOsc": {
      const fastMa = new SMA(spec.fast);
      const slowMa = new SMA(spec.slow);
      const series: LineSeries = [];
      for (const c of candles) {
        const f = fastMa.update(c.volume, false);
        const s = slowMa.update(c.volume, false);
        if (f != null && s != null) {
          const sv = Number(s);
          if (sv !== 0) {
            series.push({ time: c.time, value: ((Number(f) - sv) / sv) * 100 });
          }
        }
      }
      return { kind: "volOsc", spec, series };
    }
    case "aroon": {
      const series: AroonSeries = [];
      for (let i = spec.period; i < candles.length; i++) {
        let hi = -Infinity;
        let lo = Infinity;
        let hiIdx = i;
        let loIdx = i;
        for (let j = i - spec.period; j <= i; j++) {
          const c = candles[j]!;
          if (c.high > hi) { hi = c.high; hiIdx = j; }
          if (c.low < lo) { lo = c.low; loIdx = j; }
        }
        const barsSinceHi = i - hiIdx;
        const barsSinceLo = i - loIdx;
        const up = ((spec.period - barsSinceHi) / spec.period) * 100;
        const down = ((spec.period - barsSinceLo) / spec.period) * 100;
        series.push({ time: candles[i]!.time, up, down });
      }
      return { kind: "aroon", spec, series };
    }
    case "vortex": {
      const vmPlus: number[] = [];
      const vmMinus: number[] = [];
      const tr: number[] = [];
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i]!;
        if (i === 0) {
          vmPlus.push(0);
          vmMinus.push(0);
          tr.push(c.high - c.low);
          continue;
        }
        const prev = candles[i - 1]!;
        vmPlus.push(Math.abs(c.high - prev.low));
        vmMinus.push(Math.abs(c.low - prev.high));
        tr.push(Math.max(
          c.high - c.low,
          Math.abs(c.high - prev.close),
          Math.abs(c.low - prev.close),
        ));
      }
      const series: VortexSeries = [];
      for (let i = spec.period; i < candles.length; i++) {
        let sumPlus = 0;
        let sumMinus = 0;
        let sumTr = 0;
        for (let j = i - spec.period + 1; j <= i; j++) {
          sumPlus += vmPlus[j]!;
          sumMinus += vmMinus[j]!;
          sumTr += tr[j]!;
        }
        if (sumTr > 0) {
          series.push({
            time: candles[i]!.time,
            plus: sumPlus / sumTr,
            minus: sumMinus / sumTr,
          });
        }
      }
      return { kind: "vortex", spec, series };
    }
    case "tii": {
      const sma = new SMA(spec.majorPeriod);
      const deviations: Array<{ time: number; dev: number } | null> = [];
      for (const c of candles) {
        const v = sma.update(c.close, false);
        deviations.push(v != null ? { time: c.time, dev: c.close - Number(v) } : null);
      }
      const series: LineSeries = [];
      for (let i = 0; i < deviations.length; i++) {
        const cur = deviations[i];
        if (!cur) continue;
        let sumPos = 0;
        let sumNeg = 0;
        let count = 0;
        for (let j = Math.max(0, i - spec.minorPeriod + 1); j <= i; j++) {
          const d = deviations[j];
          if (!d) continue;
          if (d.dev > 0) sumPos += d.dev;
          else if (d.dev < 0) sumNeg += -d.dev;
          count++;
        }
        if (count < spec.minorPeriod) continue;
        const total = sumPos + sumNeg;
        const tii = total > 0 ? (100 * sumPos) / total : 50;
        series.push({ time: cur.time, value: tii });
      }
      return { kind: "tii", spec, series };
    }
    case "zscore": {
      const series: LineSeries = [];
      for (let i = spec.period - 1; i < candles.length; i++) {
        let sum = 0;
        for (let j = i - spec.period + 1; j <= i; j++) sum += candles[j]!.close;
        const mean = sum / spec.period;
        let sq = 0;
        for (let j = i - spec.period + 1; j <= i; j++) {
          const d = candles[j]!.close - mean;
          sq += d * d;
        }
        const std = Math.sqrt(sq / spec.period);
        if (std > 0) {
          series.push({ time: candles[i]!.time, value: (candles[i]!.close - mean) / std });
        }
      }
      return { kind: "zscore", spec, series };
    }
    case "bbPctB": {
      const bb = new BollingerBands(spec.period, spec.stdDev);
      const series: LineSeries = [];
      for (const c of candles) {
        const v = bb.update(c.close, false);
        if (v == null) continue;
        const upper = Number(v.upper);
        const lower = Number(v.lower);
        const width = upper - lower;
        if (width > 0) {
          series.push({ time: c.time, value: (c.close - lower) / width });
        }
      }
      return { kind: "bbPctB", spec, series };
    }
    case "hurst": {
      const series: LineSeries = [];
      // Need spec.period + 1 prices to compute spec.period log returns
      for (let i = spec.period; i < candles.length; i++) {
        const returns: number[] = [];
        for (let j = i - spec.period + 1; j <= i; j++) {
          const prev = candles[j - 1]!.close;
          const cur = candles[j]!.close;
          if (prev > 0 && cur > 0) returns.push(Math.log(cur / prev));
        }
        const n = returns.length;
        if (n < 20) continue;
        // R/S analysis across dyadic scales
        const scales: number[] = [];
        for (let k = 8; k <= Math.floor(n / 2); k *= 2) scales.push(k);
        if (scales.length < 2) continue;
        const logScales: number[] = [];
        const logRS: number[] = [];
        for (const k of scales) {
          const chunks = Math.floor(n / k);
          let total = 0;
          let valid = 0;
          for (let c = 0; c < chunks; c++) {
            const start = c * k;
            let mean = 0;
            for (let j = 0; j < k; j++) mean += returns[start + j]!;
            mean /= k;
            let cum = 0;
            let mn = Infinity;
            let mx = -Infinity;
            let sq = 0;
            for (let j = 0; j < k; j++) {
              const d = returns[start + j]! - mean;
              cum += d;
              if (cum < mn) mn = cum;
              if (cum > mx) mx = cum;
              sq += d * d;
            }
            const range = mx - mn;
            const std = Math.sqrt(sq / k);
            if (std > 0 && range > 0) {
              total += range / std;
              valid++;
            }
          }
          if (valid > 0) {
            logScales.push(Math.log(k));
            logRS.push(Math.log(total / valid));
          }
        }
        if (logScales.length < 2) continue;
        const N = logScales.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        for (let j = 0; j < N; j++) {
          sumX += logScales[j]!;
          sumY += logRS[j]!;
          sumXY += logScales[j]! * logRS[j]!;
          sumXX += logScales[j]! * logScales[j]!;
        }
        const denom = N * sumXX - sumX * sumX;
        if (denom === 0) continue;
        const slope = (N * sumXY - sumX * sumY) / denom;
        series.push({ time: candles[i]!.time, value: slope });
      }
      return { kind: "hurst", spec, series };
    }
    case "liqSweep": {
      const events: LiqSweepEvent[] = [];
      for (let i = spec.lookback; i < candles.length; i++) {
        let priorHigh = -Infinity;
        let priorLow = Infinity;
        for (let j = i - spec.lookback; j < i; j++) {
          if (candles[j]!.high > priorHigh) priorHigh = candles[j]!.high;
          if (candles[j]!.low < priorLow) priorLow = candles[j]!.low;
        }
        const bar = candles[i]!;
        if (bar.high > priorHigh && bar.close < priorHigh) {
          events.push({ time: bar.time, type: "high", level: priorHigh, wickPrice: bar.high });
        }
        if (bar.low < priorLow && bar.close > priorLow) {
          events.push({ time: bar.time, type: "low", level: priorLow, wickPrice: bar.low });
        }
      }
      return { kind: "liqSweep", spec, series: { events } };
    }
    case "fvg": {
      const start = Math.max(2, candles.length - spec.lookback);
      const gaps: FvgGap[] = [];
      for (let i = start; i < candles.length; i++) {
        const a = candles[i - 2]!;
        const c = candles[i]!;
        if (c.low > a.high) {
          gaps.push({
            time: c.time,
            endTime: null,
            top: c.low,
            bottom: a.high,
            type: "bullish",
            filled: false,
            filledTime: null,
          });
        } else if (c.high < a.low) {
          gaps.push({
            time: c.time,
            endTime: null,
            top: a.low,
            bottom: c.high,
            type: "bearish",
            filled: false,
            filledTime: null,
          });
        }
      }
      // Mark filled gaps: for each gap, scan forward for a bar that revisits the gap range.
      for (const g of gaps) {
        for (let i = 0; i < candles.length; i++) {
          const bar = candles[i]!;
          if (bar.time <= g.time) continue;
          if (g.type === "bullish" && bar.low <= g.bottom) {
            g.filled = true;
            g.filledTime = bar.time;
            g.endTime = bar.time;
            break;
          }
          if (g.type === "bearish" && bar.high >= g.top) {
            g.filled = true;
            g.filledTime = bar.time;
            g.endTime = bar.time;
            break;
          }
        }
      }
      const filtered = spec.showFilled ? gaps : gaps.filter((g) => !g.filled);
      return { kind: "fvg", spec, series: { gaps: filtered } };
    }
    case "srLevels": {
      const start = Math.max(spec.strength, candles.length - spec.lookback);
      const end = candles.length - spec.strength;
      const pivots: { time: number; price: number; type: "support" | "resistance" }[] = [];
      for (let i = start; i < end; i++) {
        const bar = candles[i]!;
        let isHigh = true;
        let isLow = true;
        for (let k = 1; k <= spec.strength; k++) {
          const left = candles[i - k]!;
          const right = candles[i + k]!;
          if (!(bar.high > left.high && bar.high > right.high)) isHigh = false;
          if (!(bar.low < left.low && bar.low < right.low)) isLow = false;
          if (!isHigh && !isLow) break;
        }
        if (isHigh) pivots.push({ time: bar.time, price: bar.high, type: "resistance" });
        if (isLow) pivots.push({ time: bar.time, price: bar.low, type: "support" });
      }
      const lastClose = candles.at(-1)?.close ?? null;
      const tol = (spec.tolerancePct / 100);
      const clusters: {
        prices: number[];
        times: number[];
        type: "support" | "resistance";
      }[] = [];
      for (const p of pivots) {
        const ref = p.price;
        const match = clusters.find(
          (c) => c.type === p.type && Math.abs(c.prices[0]! - ref) / ref <= tol,
        );
        if (match) {
          match.prices.push(p.price);
          match.times.push(p.time);
        } else {
          clusters.push({ prices: [p.price], times: [p.time], type: p.type });
        }
      }
      let levels: SrLevel[] = clusters.map((c) => ({
        price: c.prices.reduce((a, b) => a + b, 0) / c.prices.length,
        type: c.type,
        touches: c.prices.length,
        firstTime: Math.min(...c.times),
        lastTime: Math.max(...c.times),
      }));
      if (lastClose != null) {
        for (const l of levels) {
          l.type = l.price >= lastClose ? "resistance" : "support";
        }
      }
      levels.sort((a, b) => b.touches - a.touches || b.lastTime - a.lastTime);
      levels = levels.slice(0, spec.maxLevels);
      const startTime = candles[start]?.time ?? candles[0]!.time;
      const endTime = candles.at(-1)?.time ?? startTime;
      return { kind: "srLevels", spec, series: { startTime, endTime, levels } };
    }
    case "pivots": {
      const periods: PivotPeriod[] = [];
      type Bucket = { startTime: number; endTime: number; high: number; low: number; close: number };
      const buckets = new Map<string, Bucket>();
      const order: string[] = [];
      for (const c of candles) {
        const d = new Date(c.time * 1000);
        let key: string;
        if (spec.timeframe === "weekly") {
          const day = d.getUTCDay();
          const diff = (day + 6) % 7;
          const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
          key = monday.toISOString().slice(0, 10);
        } else {
          key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
        }
        const existing = buckets.get(key);
        if (existing) {
          existing.high = Math.max(existing.high, c.high);
          existing.low = Math.min(existing.low, c.low);
          existing.endTime = c.time;
          existing.close = c.close;
        } else {
          buckets.set(key, { startTime: c.time, endTime: c.time, high: c.high, low: c.low, close: c.close });
          order.push(key);
        }
      }
      for (let i = 1; i < order.length; i++) {
        const prev = buckets.get(order[i - 1]!)!;
        const curr = buckets.get(order[i]!)!;
        const h = prev.high;
        const l = prev.low;
        const c = prev.close;
        const range = h - l;
        const pp = (h + l + c) / 3;
        const levels: PivotLevel[] = [{ label: "PP", price: pp, role: "pp" }];
        if (spec.method === "classic") {
          levels.push({ label: "R1", price: 2 * pp - l, role: "resistance" });
          levels.push({ label: "R2", price: pp + range, role: "resistance" });
          levels.push({ label: "R3", price: h + 2 * (pp - l), role: "resistance" });
          levels.push({ label: "S1", price: 2 * pp - h, role: "support" });
          levels.push({ label: "S2", price: pp - range, role: "support" });
          levels.push({ label: "S3", price: l - 2 * (h - pp), role: "support" });
        } else if (spec.method === "fib") {
          levels.push({ label: "R1", price: pp + 0.382 * range, role: "resistance" });
          levels.push({ label: "R2", price: pp + 0.618 * range, role: "resistance" });
          levels.push({ label: "R3", price: pp + 1.0 * range, role: "resistance" });
          levels.push({ label: "S1", price: pp - 0.382 * range, role: "support" });
          levels.push({ label: "S2", price: pp - 0.618 * range, role: "support" });
          levels.push({ label: "S3", price: pp - 1.0 * range, role: "support" });
        } else {
          const k = 1.1;
          levels.push({ label: "R1", price: c + (k * range) / 12, role: "resistance" });
          levels.push({ label: "R2", price: c + (k * range) / 6, role: "resistance" });
          levels.push({ label: "R3", price: c + (k * range) / 4, role: "resistance" });
          levels.push({ label: "R4", price: c + (k * range) / 2, role: "resistance" });
          levels.push({ label: "S1", price: c - (k * range) / 12, role: "support" });
          levels.push({ label: "S2", price: c - (k * range) / 6, role: "support" });
          levels.push({ label: "S3", price: c - (k * range) / 4, role: "support" });
          levels.push({ label: "S4", price: c - (k * range) / 2, role: "support" });
        }
        periods.push({ startTime: curr.startTime, endTime: curr.endTime, levels });
      }
      return { kind: "pivots", spec, series: { periods } };
    }
    case "volProfile": {
      const start = Math.max(0, candles.length - spec.lookback);
      const slice = candles.slice(start);
      if (slice.length === 0) {
        return {
          kind: "volProfile",
          spec,
          series: { startTime: 0, endTime: 0, bins: [], poc: 0, vah: 0, val: 0, binWidth: 0 },
        };
      }
      let hi = -Infinity;
      let lo = Infinity;
      for (const c of slice) {
        if (c.high > hi) hi = c.high;
        if (c.low < lo) lo = c.low;
      }
      if (!Number.isFinite(hi) || !Number.isFinite(lo) || hi <= lo) {
        return {
          kind: "volProfile",
          spec,
          series: { startTime: slice[0]!.time, endTime: slice.at(-1)!.time, bins: [], poc: 0, vah: 0, val: 0, binWidth: 0 },
        };
      }
      const binWidth = (hi - lo) / spec.bins;
      const bins: VolProfileBin[] = [];
      for (let i = 0; i < spec.bins; i++) {
        bins.push({ price: lo + binWidth * (i + 0.5), volume: 0 });
      }
      for (const c of slice) {
        const barRange = c.high - c.low;
        if (barRange <= 0) {
          const idx = Math.min(spec.bins - 1, Math.max(0, Math.floor((c.close - lo) / binWidth)));
          bins[idx]!.volume += c.volume;
          continue;
        }
        const share = c.volume / spec.bins;
        const lowIdx = Math.max(0, Math.floor((c.low - lo) / binWidth));
        const highIdx = Math.min(spec.bins - 1, Math.floor((c.high - lo) / binWidth));
        const span = highIdx - lowIdx + 1;
        const per = (c.volume * (span / spec.bins)) / span;
        for (let i = lowIdx; i <= highIdx; i++) bins[i]!.volume += per;
        void share;
      }
      let pocIdx = 0;
      for (let i = 1; i < bins.length; i++) if (bins[i]!.volume > bins[pocIdx]!.volume) pocIdx = i;
      const totalVol = bins.reduce((a, b) => a + b.volume, 0);
      const target = totalVol * spec.valueAreaPct;
      let cum = bins[pocIdx]!.volume;
      let lowI = pocIdx;
      let highI = pocIdx;
      while (cum < target && (lowI > 0 || highI < bins.length - 1)) {
        const upNext = highI < bins.length - 1 ? bins[highI + 1]!.volume : -1;
        const dnNext = lowI > 0 ? bins[lowI - 1]!.volume : -1;
        if (upNext >= dnNext) {
          highI += 1;
          cum += bins[highI]!.volume;
        } else {
          lowI -= 1;
          cum += bins[lowI]!.volume;
        }
      }
      return {
        kind: "volProfile",
        spec,
        series: {
          startTime: slice[0]!.time,
          endTime: slice.at(-1)!.time,
          bins,
          poc: bins[pocIdx]!.price,
          vah: bins[highI]!.price,
          val: bins[lowI]!.price,
          binWidth,
        },
      };
    }
    case "orderBlock": {
      const start = Math.max(1, candles.length - spec.lookback);
      const blocks: OrderBlockZone[] = [];
      const thr = spec.impulsePct / 100;
      for (let i = start; i < candles.length - 1; i++) {
        const ob = candles[i]!;
        const next = candles[i + 1]!;
        const move = Math.abs(next.close - ob.close) / ob.close;
        if (move < thr) continue;
        const bearishOb = ob.close < ob.open;
        const bullishOb = ob.close > ob.open;
        if (bearishOb && next.close > ob.high) {
          blocks.push({
            time: ob.time,
            endTime: null,
            top: ob.high,
            bottom: ob.low,
            type: "bullish",
            mitigated: false,
            mitigatedTime: null,
          });
        } else if (bullishOb && next.close < ob.low) {
          blocks.push({
            time: ob.time,
            endTime: null,
            top: ob.high,
            bottom: ob.low,
            type: "bearish",
            mitigated: false,
            mitigatedTime: null,
          });
        }
      }
      for (const b of blocks) {
        for (let i = 0; i < candles.length; i++) {
          const bar = candles[i]!;
          if (bar.time <= b.time) continue;
          if (b.type === "bullish" && bar.low <= b.top && bar.low >= b.bottom) {
            b.mitigated = true;
            b.mitigatedTime = bar.time;
            b.endTime = bar.time;
            break;
          }
          if (b.type === "bearish" && bar.high >= b.bottom && bar.high <= b.top) {
            b.mitigated = true;
            b.mitigatedTime = bar.time;
            b.endTime = bar.time;
            break;
          }
        }
      }
      const filtered = spec.showMitigated ? blocks : blocks.filter((b) => !b.mitigated);
      return { kind: "orderBlock", spec, series: { blocks: filtered } };
    }
  }
}

export type AssetType = "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
export type SymbolEntry = { symbol: string; name: string; exchange: string; assetType: AssetType };

let cachedSymbols: { data: SymbolEntry[]; fetchedAt: number } | null = null;

export async function getCachedSymbols(): Promise<{ data: SymbolEntry[]; fetchedAt: number }> {
  if (!cachedSymbols) {
    const data = await fetchSymbolUniverse();
    cachedSymbols = { data, fetchedAt: Date.now() };
  }
  return cachedSymbols;
}

const NASDAQ_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt";
const OTHER_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt";

function parseNasdaqListed(text: string): SymbolEntry[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]?.split("|") ?? [];
  const idxSymbol = header.indexOf("Symbol");
  const idxName = header.indexOf("Security Name");
  const idxTest = header.indexOf("Test Issue");
  const idxEtf = header.indexOf("ETF");
  const out: SymbolEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("File Creation Time")) continue;
    const cols = line.split("|");
    if (idxTest >= 0 && cols[idxTest] === "Y") continue;
    const symbol = cols[idxSymbol]?.trim();
    const name = cols[idxName]?.trim();
    if (!symbol || !name) continue;
    const assetType: AssetType = idxEtf >= 0 && cols[idxEtf]?.trim() === "Y" ? "etf" : "stock";
    out.push({ symbol, name, exchange: "NASDAQ", assetType });
  }
  return out;
}

function parseOtherListed(text: string): SymbolEntry[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]?.split("|") ?? [];
  const idxSymbol = header.indexOf("ACT Symbol");
  const idxName = header.indexOf("Security Name");
  const idxExch = header.indexOf("Exchange");
  const idxTest = header.indexOf("Test Issue");
  const idxEtf = header.indexOf("ETF");
  const exchangeMap: Record<string, string> = {
    A: "NYSE MKT", N: "NYSE", P: "NYSE ARCA", Z: "BATS", V: "IEX",
  };
  const out: SymbolEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("File Creation Time")) continue;
    const cols = line.split("|");
    if (idxTest >= 0 && cols[idxTest] === "Y") continue;
    const symbol = cols[idxSymbol]?.trim();
    const name = cols[idxName]?.trim();
    const code = cols[idxExch]?.trim() ?? "";
    if (!symbol || !name) continue;
    const assetType: AssetType = idxEtf >= 0 && cols[idxEtf]?.trim() === "Y" ? "etf" : "stock";
    out.push({ symbol, name, exchange: exchangeMap[code] ?? code ?? "OTHER", assetType });
  }
  return out;
}

// Some build hosts (Vercel's strict tsc, e.g.) resolve a stripped-down
// `Response` interface that's missing the standard Fetch members. Casting
// through this minimal shape sidesteps it without losing functionality.
type FetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

async function fetchSymbolUniverse(): Promise<SymbolEntry[]> {
  const [a, b, tsx] = await Promise.all([
    (fetch(NASDAQ_URL) as unknown as Promise<FetchResponse>).then((r) => {
      if (!r.ok) throw new Error(`Nasdaq list HTTP ${r.status}`);
      return r.text();
    }),
    (fetch(OTHER_URL) as unknown as Promise<FetchResponse>).then((r) => {
      if (!r.ok) throw new Error(`Other list HTTP ${r.status}`);
      return r.text();
    }),
    fetchTsxCompositeSymbols().catch(() => []),
  ]);
  const tsxEntries: SymbolEntry[] = tsx.map((t) => ({
    symbol: `${t.symbol.replace(/\./g, "-")}.TO`,
    name: t.name,
    exchange: "TSX",
    assetType: "stock" as const,
  }));
  const merged = [...parseNasdaqListed(a), ...parseOtherListed(b), ...tsxEntries];
  merged.sort((x, y) => x.symbol.localeCompare(y.symbol));
  return merged;
}

export const marketRouter = createTRPCRouter({
  symbols: protectedProcedure
    .input(z.object({ force: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      if (!cachedSymbols || input?.force) {
        try {
          const data = await fetchSymbolUniverse();
          cachedSymbols = { data, fetchedAt: Date.now() };
        } catch (err) {
          console.error("[market.symbols] fetchSymbolUniverse failed:", err);
          if (!cachedSymbols) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to fetch symbols",
            });
          }
        }
      }
      return { symbols: cachedSymbols.data, fetchedAt: cachedSymbols.fetchedAt };
    }),

  searchSymbols: protectedProcedure
    .input(z.object({
      query: z.string().min(1).max(64),
      assetType: z.enum(["all", "stock", "etf", "commodity", "mutualfund", "crypto", "index"]).optional(),
      limit: z.number().int().min(1).max(25).optional(),
    }))
    .query(async ({ input }) => {
      const limit = input.limit ?? 15;
      try {
        const res = await yf.search(input.query, {
          quotesCount: 20,
          newsCount: 0,
          enableFuzzyQuery: false,
        });
        const quotes = Array.isArray(res?.quotes) ? (res.quotes as YFQuote[]) : [];
        const out: SymbolEntry[] = [];
        for (const q of quotes) {
          if (!q.symbol) continue;
          const qt = String(q.quoteType ?? "").toUpperCase();
          let assetType: AssetType;
          if (qt === "ETF") assetType = "etf";
          else if (qt === "MUTUALFUND") assetType = "mutualfund";
          else if (qt === "FUTURE" || qt === "COMMODITY") assetType = "commodity";
          else if (qt === "CRYPTOCURRENCY") assetType = "crypto";
          else if (qt === "INDEX") assetType = "index";
          else if (qt === "EQUITY") assetType = "stock";
          else continue;
          if (input.assetType && input.assetType !== "all" && input.assetType !== assetType) continue;
          const name = q.shortname ?? q.longname ?? q.name ?? q.symbol;
          const exchange = normalizeExchange(q.exchange);
          out.push({ symbol: q.symbol, name, exchange, assetType });
          if (out.length >= limit) break;
        }
        return { symbols: out };
      } catch {
        return { symbols: [] as SymbolEntry[] };
      }
    }),

  candles: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      range: RangeSchema,
      interval: IntervalSchema,
      convertTo: z.enum(["CAD"]).nullable().optional(),
    }))
    .query(async ({ input }) => {
      const symbol = input.symbol;
      const { candles, nativeCurrency, displayCurrency } = await fetchCandlesWithCurrency(
        symbol, input.range, input.interval, input.convertTo ?? null,
      );
      return { symbol, candles, nativeCurrency, displayCurrency };
    }),

  analyze: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      range: RangeSchema,
      interval: IntervalSchema,
      indicators: z.array(IndicatorSpec).max(10),
      convertTo: z.enum(["CAD"]).nullable().optional(),
    }))
    .query(({ input }) => runAnalysis({
      symbol: input.symbol,
      range: input.range,
      interval: input.interval,
      // Cast bypasses zod's all-optional inference quirk on Vercel — values
      // are validated by IndicatorSpec.parse before reaching the procedure.
      indicators: input.indicators as IndicatorSpecT[],
      convertTo: input.convertTo ?? null,
    })),

  compareSymbols: protectedProcedure
    .input(z.object({
      symbols: z.array(SymbolSchema).min(2).max(5),
      range: RangeSchema,
      interval: IntervalSchema,
      convertTo: z.enum(["CAD"]).nullable().optional(),
    }))
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.symbols.map(async (symbol) => {
          const { candles, nativeCurrency, displayCurrency } = await fetchCandlesWithCurrency(
            symbol, input.range, input.interval, input.convertTo ?? null,
          );

          const first = candles[0];
          const last = candles[candles.length - 1];
          const periodReturn = first && last && first.close !== 0
            ? ((last.close - first.close) / first.close) * 100
            : null;

          let volatility: number | null = null;
          if (candles.length >= 2) {
            const returns: number[] = [];
            for (let i = 1; i < candles.length; i++) {
              const prev = candles[i - 1]!.close;
              if (prev !== 0) returns.push((candles[i]!.close - prev) / prev);
            }
            if (returns.length > 1) {
              const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
              const variance = returns.reduce((a, r) => a + (r - mean) ** 2, 0) / (returns.length - 1);
              volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
            }
          }

          let rsi14: number | null = null;
          const rsiInd = new RSI(14);
          for (const c of candles) {
            const v = rsiInd.update(c.close, false);
            if (v != null) rsi14 = Number(v);
          }

          let sma50: number | null = null;
          const sma50Ind = new SMA(50);
          for (const c of candles) {
            const v = sma50Ind.update(c.close, false);
            if (v != null) sma50 = Number(v);
          }

          let sma200: number | null = null;
          if (candles.length >= 200) {
            const sma200Ind = new SMA(200);
            for (const c of candles) {
              const v = sma200Ind.update(c.close, false);
              if (v != null) sma200 = Number(v);
            }
          }

          return {
            symbol,
            candles,
            nativeCurrency,
            displayCurrency,
            periodReturn,
            volatility,
            rsi14,
            sma50,
            sma200,
            lastClose: last?.close ?? null,
          };
        }),
      );
      return results;
    }),

  getDividendInfo: protectedProcedure
    .input(z.object({ symbols: z.array(SymbolSchema).min(1).max(50) }))
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.symbols.map(async (symbol) => {
          try {
            const summary = await yf.quoteSummary(symbol, {
              modules: ["summaryDetail", "calendarEvents"],
            });
            const sd = summary.summaryDetail;
            const ce = summary.calendarEvents;
            const rate = sd?.dividendRate ?? sd?.trailingAnnualDividendRate ?? null;
            const yld = sd?.dividendYield ?? sd?.trailingAnnualDividendYield ?? sd?.yield ?? null;
            return {
              symbol,
              dividendRate: rate ?? null,
              dividendYield: yld ?? null,
              exDividendDate: sd?.exDividendDate?.toISOString().slice(0, 10) ?? null,
              dividendDate: ce?.dividendDate?.toISOString().slice(0, 10) ?? null,
              error: null as string | null,
            };
          } catch {
            return {
              symbol,
              dividendRate: null,
              dividendYield: null,
              exDividendDate: null,
              dividendDate: null,
              error: "fetch failed" as string | null,
            };
          }
        }),
      );
      return results;
    }),

  getEarningsCalendar: protectedProcedure
    .input(z.object({ symbols: z.array(SymbolSchema).min(1).max(100) }))
    .query(async ({ input }) => {
      type CalendarEvent = {
        symbol: string;
        eventType: "earnings" | "ex-dividend" | "dividend";
        date: string;
        title: string;
        details: Record<string, unknown>;
      };

      const allEvents: CalendarEvent[] = [];

      const results = await Promise.allSettled(
        input.symbols.map(async (symbol) => {
          const summary = await yf.quoteSummary(symbol, {
            modules: ["calendarEvents", "summaryDetail", "earningsHistory"],
          });

          const ce = summary.calendarEvents;
          const sd = summary.summaryDetail;
          const eh = summary.earningsHistory;

          if (ce?.earnings?.earningsDate) {
            for (const d of ce.earnings.earningsDate) {
              allEvents.push({
                symbol,
                eventType: "earnings",
                date: d.toISOString().slice(0, 10),
                title: `${symbol} Earnings`,
                details: {
                  earningsAverage: ce.earnings.earningsAverage ?? null,
                  earningsHigh: ce.earnings.earningsHigh ?? null,
                  earningsLow: ce.earnings.earningsLow ?? null,
                  revenueAverage: ce.earnings.revenueAverage ?? null,
                },
              });
            }
          }

          if (sd?.exDividendDate) {
            allEvents.push({
              symbol,
              eventType: "ex-dividend",
              date: sd.exDividendDate.toISOString().slice(0, 10),
              title: `${symbol} Ex-Dividend`,
              details: {
                dividendRate: sd.dividendRate ?? null,
                dividendYield: sd.dividendYield ?? null,
              },
            });
          }

          if (ce?.dividendDate) {
            allEvents.push({
              symbol,
              eventType: "dividend",
              date: ce.dividendDate.toISOString().slice(0, 10),
              title: `${symbol} Dividend Payment`,
              details: {
                dividendRate: sd?.dividendRate ?? null,
              },
            });
          }

          if (eh?.history) {
            for (const entry of eh.history.slice(-4)) {
              if (entry.quarter) {
                allEvents.push({
                  symbol,
                  eventType: "earnings",
                  date: entry.quarter.toISOString().slice(0, 10),
                  title: `${symbol} Earnings (past)`,
                  details: {
                    epsActual: entry.epsActual ?? null,
                    epsEstimate: entry.epsEstimate ?? null,
                    epsDifference: entry.epsDifference ?? null,
                    surprisePercent: entry.surprisePercent ?? null,
                  },
                });
              }
            }
          }
        }),
      );

      const errors: string[] = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i]!.status === "rejected") {
          errors.push(input.symbols[i]!.toUpperCase());
        }
      }

      allEvents.sort((a, b) => a.date.localeCompare(b.date));

      return { events: allEvents, errors };
    }),

  getCompanyProfile: protectedProcedure
    .input(z.object({ symbol: SymbolSchema }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      return client.getCompanyProfile(input.symbol);
    }),

  getHistoricalReturns: protectedProcedure
    .input(z.object({ symbol: SymbolSchema }))
    .query(async ({ input }) => {
      // Bypass OpenBB here. OpenBB's yfinance provider returns pre-adjusted
      // close in the `close` field with no separate `adj_close`, so TR and PR
      // would collapse to the same number. yahoo-finance2.chart reliably
      // returns both `close` (raw) and `adjclose` (dividend/split-adjusted).
      type ReturnPair = { tr: number | null; pr: number | null };
      const emptyPair: ReturnPair = { tr: null, pr: null };
      const emptyTrailing = {
        "6m": { ...emptyPair },
        "1y": { ...emptyPair },
        "2y": { ...emptyPair },
        "5y": { ...emptyPair },
        "10y": { ...emptyPair },
      };
      type YearlyEntry = { year: number; tr: number | null; pr: number | null; ytd: boolean };

      // 11y window covers the 10y trailing return plus slack for the pick.
      const result = await yf
        .chart(input.symbol, {
          period1: new Date(Date.now() - 11 * 365.25 * 24 * 60 * 60 * 1000),
          interval: "1d",
          return: "array",
        })
        .catch(() => null);
      type RawQuote = { date: Date; close: number | null; adjclose?: number | null };
      const rawQuotes = (result?.quotes ?? []) as RawQuote[];
      type C = { time: number; close: number; adjClose: number | null };
      const candles: C[] = [];
      for (const q of rawQuotes) {
        if (q.close == null || !Number.isFinite(q.close)) continue;
        candles.push({
          time: Math.floor(q.date.getTime() / 1000),
          close: q.close,
          adjClose: typeof q.adjclose === "number" ? q.adjclose : null,
        });
      }
      if (candles.length < 2) {
        return { ...emptyTrailing, yearly: [] as YearlyEntry[] };
      }

      // TR (total return) uses dividend/split-adjusted close when the provider
      // exposes it; falls back to raw close when unavailable, matching PR.
      // PR (price return) always uses the raw close.
      const trPrice = (c: C): number =>
        c.adjClose != null && c.adjClose > 0 ? c.adjClose : c.close;
      const prPrice = (c: C): number => c.close;
      const pctChange = (from: number, to: number): number | null =>
        from > 0 ? ((to - from) / from) * 100 : null;

      const last = candles[candles.length - 1]!;
      const lastTr = trPrice(last);
      const lastPr = prPrice(last);
      const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
      const periods = [
        { key: "6m" as const, years: 0.5 },
        { key: "1y" as const, years: 1 },
        { key: "2y" as const, years: 2 },
        { key: "5y" as const, years: 5 },
        { key: "10y" as const, years: 10 },
      ];

      const trailing: Record<"6m" | "1y" | "2y" | "5y" | "10y", ReturnPair> = {
        "6m": { ...emptyPair },
        "1y": { ...emptyPair },
        "2y": { ...emptyPair },
        "5y": { ...emptyPair },
        "10y": { ...emptyPair },
      };
      for (const p of periods) {
        const targetTime = last.time - p.years * SECONDS_PER_YEAR;
        const ref = candles.find((c) => c.time >= targetTime);
        if (!ref || ref.time >= last.time) continue;
        const coverage = (last.time - ref.time) / (p.years * SECONDS_PER_YEAR);
        if (coverage < 0.8) continue;
        trailing[p.key] = {
          tr: pctChange(trPrice(ref), lastTr),
          pr: pctChange(prPrice(ref), lastPr),
        };
      }

      // Calendar-year returns: current year YTD + last 4 complete years.
      const currentYear = new Date(last.time * 1000).getUTCFullYear();
      const yearly: YearlyEntry[] = [];
      for (let i = 0; i <= 4; i++) {
        const year = currentYear - i;
        const isYtd = i === 0;
        const yearEndSec = Math.floor(Date.UTC(year + 1, 0, 1) / 1000);
        const priorYearEndSec = Math.floor(Date.UTC(year, 0, 1) / 1000);
        let endCandle: typeof last | undefined;
        let priorEndCandle: typeof last | undefined;
        for (const c of candles) {
          if (c.time < priorYearEndSec) priorEndCandle = c;
          else if (c.time < yearEndSec) endCandle = c;
          else break;
        }
        if (!endCandle || !priorEndCandle) {
          yearly.push({ year, tr: null, pr: null, ytd: isYtd });
          continue;
        }
        yearly.push({
          year,
          ytd: isYtd,
          tr: pctChange(trPrice(priorEndCandle), trPrice(endCandle)),
          pr: pctChange(prPrice(priorEndCandle), prPrice(endCandle)),
        });
      }

      return { ...trailing, yearly };
    }),

  getFinancialStatements: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      statementType: z.enum(["income", "balance", "cash"]),
      period: z.enum(["annual", "quarterly"]).default("annual"),
      limit: z.number().int().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const symbol = input.symbol;
      switch (input.statementType) {
        case "income": return client.getIncomeStatement(symbol, { period: input.period, limit: input.limit });
        case "balance": return client.getBalanceSheet(symbol, { period: input.period, limit: input.limit });
        case "cash": return client.getCashFlow(symbol, { period: input.period, limit: input.limit });
      }
    }),

  getOptionsChain: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      expiration: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      return client.getOptionsChain(input.symbol, {
        expiration: input.expiration,
      });
    }),

  getEconomicIndicators: protectedProcedure
    .input(z.object({
      country: z.string().default("united_states"),
      indicator: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      return client.getEconomicIndicators({
        country: input.country,
        indicator: input.indicator,
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  getFredSeries: protectedProcedure
    .input(z.object({
      seriesId: z.string().trim().min(1).max(50).regex(/^[A-Za-z0-9_]+$/, "Invalid FRED series ID"),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      return client.getFredSeries(input.seriesId, {
        startDate: input.startDate,
        endDate: input.endDate,
      });
    }),

  getIndexConstituents: protectedProcedure
    .input(z.object({
      indexSymbol: z.enum(["sp500", "nasdaq", "dowjones", "tsx", "tsx60"]),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const isCanadian = input.indexSymbol === "tsx" || input.indexSymbol === "tsx60";
      if (isOpenBBEnabled() && !isCanadian) {
        try {
          const result = await getOpenBBClient().getIndexConstituents(input.indexSymbol, input.provider);
          if (result.length > 0) return result;
        } catch {
          // fall through to Wikipedia
        }
      }
      try {
        return await fetchIndexConstituentsFromWikipedia(input.indexSymbol);
      } catch {
        return [];
      }
    }),

  getAnalystConsensus: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, provider: z.string().optional() }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const providers = input.provider ? [input.provider] : ["yfinance", "fmp"];
      return tryProviders(providers, (provider) =>
        client.getAnalystConsensus(input.symbol, provider),
      );
    }),

  getPriceTargets: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      limit: z.number().int().min(1).max(100).default(25),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const providers = input.provider ? [input.provider] : ["benzinga", "fmp"];
      const result = await tryProviders(
        providers,
        (provider) => client.getPriceTargets(input.symbol, { limit: input.limit, provider }),
        (r) => r.length > 0,
      );
      return result ?? [];
    }),

  getInsiderTrading: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      limit: z.number().int().min(1).max(200).default(50),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const providers = input.provider ? [input.provider] : ["sec", "fmp"];
      const result = await tryProviders(
        providers,
        (provider) => client.getInsiderTrading(input.symbol, { limit: input.limit, provider }),
        (r) => r.length > 0,
      );
      return result ?? [];
    }),

  getInstitutionalHolders: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      limit: z.number().int().min(1).max(200).default(25),
      provider: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const providers = input.provider ? [input.provider] : ["fmp"];
      const result = await tryProviders(
        providers,
        (provider) => client.getInstitutionalHolders(input.symbol, { limit: input.limit, provider }),
        (r) => r.length > 0,
      );
      return result ?? [];
    }),

  getShortInterest: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, provider: z.string().optional() }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const providers = input.provider ? [input.provider] : ["finra"];
      const result = await tryProviders(
        providers,
        (provider) => client.getShortInterest(input.symbol, provider),
        (r) => r.length > 0,
      );
      return result ?? [];
    }),

  getEtfInfo: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, provider: z.string().optional() }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      return tryOrNull(() => client.getEtfInfo(input.symbol, input.provider));
    }),

  getEtfHoldings: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      provider: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const result = await tryOrNull(() =>
        client.getEtfHoldings(input.symbol, {
          ...(input.provider ? { provider: input.provider } : {}),
          ...(input.limit != null ? { limit: input.limit } : {}),
        }),
      );
      return result ?? [];
    }),

  getEtfSectors: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, provider: z.string().optional() }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const result = await tryOrNull(() => client.getEtfSectors(input.symbol, input.provider));
      return result ?? [];
    }),

  getEtfCountries: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, provider: z.string().optional() }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const result = await tryOrNull(() => client.getEtfCountries(input.symbol, input.provider));
      return result ?? [];
    }),

  providerStatus: protectedProcedure
    .query(async () => {
      if (!isOpenBBEnabled()) {
        return { active: "yahoo" as const, openbbEnabled: false, openbbHealthy: false };
      }
      const healthy = await getOpenBBClient().isHealthy().catch(() => false);
      return {
        active: healthy ? ("openbb" as const) : ("yahoo" as const),
        openbbEnabled: true,
        openbbHealthy: healthy,
      };
    }),

  getCryptoCandles: protectedProcedure
    .input(z.object({
      symbol: z.string().trim().min(1).max(20),
      range: RangeSchema,
      interval: IntervalSchema,
    }))
    .query(async ({ input }) => {
      const client = requireOpenBBClient();
      const bars = await client.getCryptoHistorical(input.symbol.toUpperCase(), {
        startDate: rangeToPeriod1(input.range).toISOString().slice(0, 10),
        interval: input.interval,
      });
      return {
        symbol: input.symbol.toUpperCase(),
        candles: bars.map((b: OHLCVBar) => ({
          time: Math.floor(new Date(b.date.includes("T") ? b.date : b.date + "T00:00:00Z").getTime() / 1000),
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
          volume: b.volume,
        })),
      };
    }),
});
