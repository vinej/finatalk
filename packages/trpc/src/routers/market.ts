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
import YahooFinance from "yahoo-finance2";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import {
  IndicatorSpec,
  IntervalSchema,
  RangeSchema,
  SymbolSchema,
} from "../schemas/indicator";

const yf = new YahooFinance();

type IndicatorSpecT = z.infer<typeof IndicatorSpec>;

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function rangeToPeriod1(range: z.infer<typeof RangeSchema>): Date {
  const now = new Date();
  if (range === "max") return new Date(1970, 0, 1);
  const months: Record<Exclude<typeof range, "max">, number> = {
    "1mo": 1, "3mo": 3, "6mo": 6, "1y": 12, "2y": 24, "5y": 60,
  };
  const d = new Date(now);
  d.setMonth(d.getMonth() - months[range]);
  return d;
}

async function fetchChart(symbol: string, range: z.infer<typeof RangeSchema>, interval: z.infer<typeof IntervalSchema>) {
  try {
    return await yf.chart(symbol, {
      period1: rangeToPeriod1(range),
      interval,
      return: "array",
    });
  } catch (err) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: err instanceof Error ? err.message : `Failed to fetch ${symbol}`,
    });
  }
}

function extractCandles(result: Awaited<ReturnType<typeof fetchChart>>): Candle[] {
  const candles: Candle[] = [];
  for (const q of result.quotes) {
    if (q.open == null || q.high == null || q.low == null || q.close == null) continue;
    candles.push({
      time: Math.floor(q.date.getTime() / 1000),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume ?? 0,
    });
  }
  return candles;
}

async function fetchFxRates(fromCcy: string, toCcy: string, range: z.infer<typeof RangeSchema>, interval: z.infer<typeof IntervalSchema>): Promise<Map<number, number>> {
  const pair = `${fromCcy}${toCcy}=X`;
  const result = await fetchChart(pair, range, interval);
  const byTime = new Map<number, number>();
  for (const q of result.quotes) {
    if (q.close == null) continue;
    byTime.set(Math.floor(q.date.getTime() / 1000), q.close);
  }
  return byTime;
}

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
    });
  }
  return out;
}

export async function fetchCandlesWithCurrency(
  symbol: string,
  range: z.infer<typeof RangeSchema>,
  interval: z.infer<typeof IntervalSchema>,
  convertTo: string | null,
): Promise<{ candles: Candle[]; nativeCurrency: string; displayCurrency: string }> {
  const result = await fetchChart(symbol, range, interval);
  const nativeCurrency = (result.meta.currency ?? "USD").toUpperCase();
  let candles = extractCandles(result);
  if (candles.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `No data for ${symbol}` });
  }
  const target = convertTo ? convertTo.toUpperCase() : null;
  if (!target || target === nativeCurrency) {
    return { candles, nativeCurrency, displayCurrency: nativeCurrency };
  }
  const rates = await fetchFxRates(nativeCurrency, target, range, interval);
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
type CrossEvent = { time: number; direction: "bull" | "bear"; price: number };
type MaCrossSeries = { fast: LineSeries; slow: LineSeries; events: CrossEvent[] };
type MacdCrossSeries = { macd: MacdSeries; events: CrossEvent[] };

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
  | { kind: "psar"; spec: Extract<IndicatorSpecT, { kind: "psar" }>; series: LineSeries }
  | { kind: "maCross"; spec: Extract<IndicatorSpecT, { kind: "maCross" }>; series: MaCrossSeries }
  | { kind: "macdCross"; spec: Extract<IndicatorSpecT, { kind: "macdCross" }>; series: MacdCrossSeries };

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
      const obv = new OBV(1);
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
  }
}

export type AssetType = "stock" | "etf";
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

async function fetchSymbolUniverse(): Promise<SymbolEntry[]> {
  const [a, b] = await Promise.all([
    fetch(NASDAQ_URL).then((r) => {
      if (!r.ok) throw new Error(`Nasdaq list HTTP ${r.status}`);
      return r.text();
    }),
    fetch(OTHER_URL).then((r) => {
      if (!r.ok) throw new Error(`Other list HTTP ${r.status}`);
      return r.text();
    }),
  ]);
  const merged = [...parseNasdaqListed(a), ...parseOtherListed(b)];
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
          if (!cachedSymbols) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: err instanceof Error ? err.message : "Failed to fetch symbols",
            });
          }
        }
      }
      return { symbols: cachedSymbols.data, fetchedAt: cachedSymbols.fetchedAt };
    }),

  candles: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      range: RangeSchema,
      interval: IntervalSchema,
      convertTo: z.enum(["CAD"]).nullable().optional(),
    }))
    .query(async ({ input }) => {
      const symbol = input.symbol.toUpperCase();
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
      indicators: input.indicators,
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
        input.symbols.map(async (sym) => {
          const symbol = sym.toUpperCase();
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
        input.symbols.map(async (sym) => {
          const symbol = sym.toUpperCase();
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
});
