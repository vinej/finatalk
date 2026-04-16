import { TRPCError } from "@trpc/server";
import { BollingerBands, DEMA, EMA, MACD, MOM, RMA, ROC, RSI, SMA, WMA } from "trading-signals";
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

async function fetchCandlesWithCurrency(
  symbol: string,
  range: z.infer<typeof RangeSchema>,
  interval: z.infer<typeof IntervalSchema>,
  convertTo: "CAD" | null,
): Promise<{ candles: Candle[]; nativeCurrency: string; displayCurrency: string }> {
  const result = await fetchChart(symbol, range, interval);
  const nativeCurrency = (result.meta.currency ?? "USD").toUpperCase();
  let candles = extractCandles(result);
  if (candles.length === 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `No data for ${symbol}` });
  }
  if (!convertTo || convertTo === nativeCurrency) {
    return { candles, nativeCurrency, displayCurrency: nativeCurrency };
  }
  const rates = await fetchFxRates(nativeCurrency, convertTo, range, interval);
  if (rates.size === 0) {
    return { candles, nativeCurrency, displayCurrency: nativeCurrency };
  }
  candles = applyFx(candles, rates);
  return { candles, nativeCurrency, displayCurrency: convertTo };
}

type LineSeries = { time: number; value: number }[];
type MacdSeries = { time: number; macd: number; signal: number; histogram: number }[];
type BandsSeries = { time: number; upper: number; middle: number; lower: number }[];

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
  | { kind: "bbands"; spec: Extract<IndicatorSpecT, { kind: "bbands" }>; series: BandsSeries };

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
  }
}

type SymbolEntry = { symbol: string; name: string; exchange: string };

let cachedSymbols: { data: SymbolEntry[]; fetchedAt: number } | null = null;

const NASDAQ_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt";
const OTHER_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt";

function parseNasdaqListed(text: string): SymbolEntry[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]?.split("|") ?? [];
  const idxSymbol = header.indexOf("Symbol");
  const idxName = header.indexOf("Security Name");
  const idxTest = header.indexOf("Test Issue");
  const out: SymbolEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith("File Creation Time")) continue;
    const cols = line.split("|");
    if (idxTest >= 0 && cols[idxTest] === "Y") continue;
    const symbol = cols[idxSymbol]?.trim();
    const name = cols[idxName]?.trim();
    if (!symbol || !name) continue;
    out.push({ symbol, name, exchange: "NASDAQ" });
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
    out.push({ symbol, name, exchange: exchangeMap[code] ?? code ?? "OTHER" });
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
});
