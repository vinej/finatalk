import { getOpenBBClient, isOpenBBEnabled, type OHLCVBar } from "@finatalk/openbb";
import YahooFinance from "yahoo-finance2";
import type { z } from "zod";
import type { IntervalSchema, RangeSchema } from "../schemas/indicator";

type Range = z.infer<typeof RangeSchema>;
type Interval = z.infer<typeof IntervalSchema>;

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type ProviderResult<T> = { data: T; provider: "openbb" | "yahoo" };

const yf = new YahooFinance();

export function rangeToPeriod1(range: Range): Date {
  const now = new Date();
  if (range === "max") return new Date(1970, 0, 1);
  const d = new Date(now);
  if (range === "1d") { d.setDate(d.getDate() - 1); return d; }
  if (range === "5d") { d.setDate(d.getDate() - 5); return d; }
  const months: Record<Exclude<Range, "max" | "1d" | "5d">, number> = {
    "1mo": 1, "3mo": 3, "6mo": 6, "1y": 12, "2y": 24, "5y": 60,
  };
  d.setMonth(d.getMonth() - months[range]);
  return d;
}

function mapInterval(interval: Interval): string {
  return interval;
}

function openbbBarToCandle(bar: OHLCVBar): Candle {
  const date = bar.date.includes("T") ? new Date(bar.date) : new Date(bar.date + "T00:00:00Z");
  return {
    time: Math.floor(date.getTime() / 1000),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
  };
}

export async function fetchChartWithFallback(
  symbol: string,
  range: Range,
  interval: Interval,
): Promise<ProviderResult<{ candles: Candle[]; currency: string }>> {
  if (isOpenBBEnabled()) {
    try {
      const client = getOpenBBClient();
      const bars = await client.getHistoricalPrice(symbol, {
        startDate: rangeToPeriod1(range).toISOString().slice(0, 10),
        interval: mapInterval(interval),
        provider: "yfinance",
      });
      const candles = bars.map(openbbBarToCandle).filter((c) => c.open > 0);
      if (candles.length > 0) {
        let currency = "USD";
        try {
          const quote = await client.getQuote(symbol);
          if (quote.symbol.endsWith(".TO") || quote.symbol.endsWith(".V")) currency = "CAD";
          else if (quote.symbol.endsWith(".L")) currency = "GBP";
        } catch { /* default USD */ }
        return { data: { candles, currency }, provider: "openbb" };
      }
    } catch {
      // fall through to yahoo
    }
  }

  const result = await yf.chart(symbol, {
    period1: rangeToPeriod1(range),
    interval,
    return: "array",
  });
  const currency = (result.meta.currency ?? "USD").toUpperCase();
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
  return { data: { candles, currency }, provider: "yahoo" };
}

export type AssetType = "equity" | "etf" | "mutualfund" | "index" | "crypto" | "currency" | "future" | "option" | null;

const QUOTE_TYPE_MAP: Record<string, Exclude<AssetType, null>> = {
  EQUITY: "equity",
  ETF: "etf",
  MUTUALFUND: "mutualfund",
  INDEX: "index",
  CRYPTOCURRENCY: "crypto",
  CURRENCY: "currency",
  FUTURE: "future",
  OPTION: "option",
};

export async function resolveAssetType(symbol: string): Promise<AssetType> {
  const sym = symbol.trim().toUpperCase();
  if (!sym) return null;
  try {
    const q = await yf.quote(sym);
    const raw = typeof (q as { quoteType?: unknown }).quoteType === "string"
      ? (q as { quoteType: string }).quoteType.toUpperCase()
      : null;
    if (raw && QUOTE_TYPE_MAP[raw]) return QUOTE_TYPE_MAP[raw];
    return null;
  } catch {
    return null;
  }
}

export async function fetchFxRatesWithFallback(
  fromCcy: string,
  toCcy: string,
  range: Range,
  interval: Interval,
): Promise<Map<number, number>> {
  if (isOpenBBEnabled()) {
    try {
      const client = getOpenBBClient();
      const pair = `${fromCcy}${toCcy}`;
      const bars = await client.getCurrencyHistorical(pair, {
        startDate: rangeToPeriod1(range).toISOString().slice(0, 10),
        interval: mapInterval(interval),
        provider: "yfinance",
      });
      const byTime = new Map<number, number>();
      for (const bar of bars) {
        if (bar.close > 0) {
          const candle = openbbBarToCandle(bar);
          byTime.set(candle.time, bar.close);
        }
      }
      if (byTime.size > 0) return byTime;
    } catch {
      // fall through to yahoo
    }
  }

  const pair = `${fromCcy}${toCcy}=X`;
  const result = await yf.chart(pair, {
    period1: rangeToPeriod1(range),
    interval,
    return: "array",
  });
  const byTime = new Map<number, number>();
  for (const q of result.quotes) {
    if (q.close == null) continue;
    byTime.set(Math.floor(q.date.getTime() / 1000), q.close);
  }
  return byTime;
}

export async function fetchQuoteWithFallback(
  symbol: string,
): Promise<ProviderResult<{ last: number; change: number | null; changePercent: number | null }>> {
  if (isOpenBBEnabled()) {
    try {
      const client = getOpenBBClient();
      const quote = await client.getQuote(symbol);
      return {
        data: {
          last: quote.last,
          change: quote.change,
          changePercent: quote.changePercent,
        },
        provider: "openbb",
      };
    } catch {
      // fall through
    }
  }

  const result = await yf.chart(symbol, {
    period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    interval: "1d",
    return: "array",
  });
  const quotes = result.quotes;
  const last = quotes[quotes.length - 1];
  const prev = quotes.length >= 2 ? quotes[quotes.length - 2] : undefined;
  return {
    data: {
      last: last?.close ?? 0,
      change: last?.close != null && prev?.close != null ? last.close - prev.close : null,
      changePercent: last?.close != null && prev?.close != null && prev.close !== 0 ? ((last.close - prev.close) / prev.close) * 100 : null,
    },
    provider: "yahoo",
  };
}

