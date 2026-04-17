import { createFileRoute } from "@tanstack/react-router";
import {
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  type Time,
  createChart,
} from "lightweight-charts";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/comparison")({
  component: ComparisonPage,
});

const PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
] as const;

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
type Range = (typeof RANGES)[number];

const INTERVALS = ["1d", "1wk", "1mo"] as const;
type Interval = (typeof INTERVALS)[number];

function formatPct(v: number | null) {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function formatNum(v: number | null, decimals = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(decimals);
}

function ComparisonPage() {
  const { t } = useTranslation();

  const [symbols, setSymbols] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [range, setRange] = useState<Range>("6mo");
  const [interval, setInterval] = useState<Interval>("1d");
  const [convertToCad, setConvertToCad] = useState(false);

  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const symbolSuggestions = useMemo(() => {
    const raw = symbolsQuery.data?.symbols ?? [];
    const q = inputValue.trim().toUpperCase();
    if (!q) return raw.slice(0, 200);
    const starts: typeof raw = [];
    const contains: typeof raw = [];
    for (const s of raw) {
      if (s.symbol.startsWith(q)) starts.push(s);
      else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q))
        contains.push(s);
      if (starts.length >= 200) break;
    }
    return [...starts, ...contains].slice(0, 200);
  }, [symbolsQuery.data, inputValue]);

  function addSymbol(e: React.FormEvent) {
    e.preventDefault();
    const sym = inputValue.trim().toUpperCase();
    if (!sym || symbols.length >= 5 || symbols.includes(sym)) return;
    setSymbols((prev) => [...prev, sym]);
    setInputValue("");
  }

  function removeSymbol(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym));
  }

  const compareQuery = trpc.market.compareSymbols.useQuery(
    {
      symbols,
      range,
      interval,
      convertTo: convertToCad ? "CAD" : null,
    },
    {
      enabled: symbols.length >= 2,
      staleTime: 60_000,
      retry: false,
    },
  );

  const data = compareQuery.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold">{t("comparison.title")}</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <form onSubmit={addSymbol} className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="cmp-symbol"
                  className="text-[10px] uppercase text-[var(--color-muted-fg)]"
                >
                  {t("comparison.addSymbol")}
                </label>
                <Input
                  id="cmp-symbol"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  list="comparison-symbol-suggestions"
                  autoComplete="off"
                  className="h-8 w-28 uppercase"
                  placeholder={t("comparison.placeholder")}
                  maxLength={20}
                  disabled={symbols.length >= 5}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={
                  symbols.length >= 5 || !inputValue.trim()
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("comparison.addSymbol")}
              </Button>
            </form>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="cmp-range"
                className="text-[10px] uppercase text-[var(--color-muted-fg)]"
              >
                {t("analysis.range")}
              </label>
              <select
                id="cmp-range"
                value={range}
                onChange={(e) => setRange(e.target.value as Range)}
                className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="cmp-interval"
                className="text-[10px] uppercase text-[var(--color-muted-fg)]"
              >
                {t("analysis.interval")}
              </label>
              <select
                id="cmp-interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value as Interval)}
                className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                {INTERVALS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={convertToCad}
                onChange={(e) => setConvertToCad(e.target.checked)}
                className="rounded"
              />
              {t("analysis.showInCad")}
            </label>
          </div>

          {symbols.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {symbols.map((sym, i) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-sm font-medium"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  {sym}
                  <button
                    type="button"
                    onClick={() => removeSymbol(sym)}
                    className="ml-0.5 rounded p-0.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                    title={t("comparison.removeSymbol")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {symbols.length >= 5 && (
                <span className="self-center text-xs text-[var(--color-muted-fg)]">
                  {t("comparison.max5")}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {symbols.length < 2 && (
        <p className="text-center text-sm text-[var(--color-muted-fg)]">
          {t("comparison.min2")}
        </p>
      )}

      {symbols.length >= 2 && compareQuery.isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("comparison.loading")}
        </div>
      )}

      {symbols.length >= 2 && compareQuery.isError && (
        <p className="text-center text-sm text-[var(--color-destructive)]">
          {t("comparison.loadFailed")}
        </p>
      )}

      {data.length >= 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {t("comparison.normalized")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonChart data={data} />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {data.map((d, i) => (
                  <span
                    key={d.symbol}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: PALETTE[i % PALETTE.length],
                      }}
                    />
                    <span className="text-[var(--color-fg)]">{d.symbol}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {t("comparison.metrics")}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <MetricsTable data={data} />
            </CardContent>
          </Card>
        </>
      )}

      <datalist id="comparison-symbol-suggestions">
        {symbolSuggestions.map((s) => (
          <option key={s.symbol} value={s.symbol}>
            {s.name} ({s.exchange})
            {s.assetType === "etf" ? " · ETF" : ""}
          </option>
        ))}
      </datalist>
    </div>
  );
}

type CompareItem = {
  symbol: string;
  candles: { time: number; close: number }[];
  periodReturn: number | null;
  volatility: number | null;
  rsi14: number | null;
  sma50: number | null;
  sma200: number | null;
  lastClose: number | null;
};

function ComparisonChart({ data }: { data: CompareItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line">[]>([]);

  const seriesData = useMemo(
    () =>
      data.map((d, i) => {
        const candles = d.candles;
        if (candles.length === 0)
          return { color: PALETTE[i % PALETTE.length]!, points: [] as { time: Time; value: number }[] };
        const base = candles[0]!.close;
        if (!Number.isFinite(base) || base === 0)
          return { color: PALETTE[i % PALETTE.length]!, points: [] as { time: Time; value: number }[] };
        const points = candles.map((c) => ({
          time: c.time as Time,
          value: (c.close / base) * 100,
        }));
        return { color: PALETTE[i % PALETTE.length]!, points };
      }),
    [data],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#e5e7eb" : "#1f2937";
    const gridColor = isDark ? "#374151" : "#e5e7eb";
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: { timeVisible: false, secondsVisible: false },
      rightPriceScale: { borderColor: gridColor },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    for (const s of seriesRef.current) chart.removeSeries(s);
    seriesRef.current = [];
    for (const { color, points } of seriesData) {
      if (points.length === 0) continue;
      const s = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(points);
      seriesRef.current.push(s);
    }
    if (seriesRef.current.length > 0) chart.timeScale().fitContent();
  }, [seriesData]);

  return <div ref={containerRef} className="h-96 w-full" />;
}

function MetricsTable({ data }: { data: CompareItem[] }) {
  const { t } = useTranslation();

  const metrics: { label: string; getValue: (d: CompareItem) => string; align: "left" | "right"; tone?: (d: CompareItem) => "pos" | "neg" | "neutral" }[] = [
    {
      label: t("comparison.lastClose"),
      getValue: (d) => formatNum(d.lastClose),
      align: "right",
    },
    {
      label: t("comparison.periodReturn"),
      getValue: (d) => formatPct(d.periodReturn),
      align: "right",
      tone: (d) =>
        d.periodReturn == null
          ? "neutral"
          : d.periodReturn >= 0
            ? "pos"
            : "neg",
    },
    {
      label: t("comparison.volatility"),
      getValue: (d) => formatPct(d.volatility),
      align: "right",
    },
    {
      label: t("comparison.rsi14"),
      getValue: (d) => formatNum(d.rsi14, 1),
      align: "right",
    },
    {
      label: t("comparison.sma50"),
      getValue: (d) => formatNum(d.sma50),
      align: "right",
    },
    {
      label: t("comparison.sma200"),
      getValue: (d) => formatNum(d.sma200),
      align: "right",
    },
  ];

  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
          <th className="px-2 py-2 font-medium">{t("comparison.metrics")}</th>
          {data.map((d, i) => (
            <th key={d.symbol} className="px-2 py-2 text-right font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                {d.symbol}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metrics.map((m) => (
          <tr
            key={m.label}
            className="border-b border-[var(--color-border)]"
          >
            <td className="px-2 py-2 text-xs font-medium text-[var(--color-muted-fg)]">
              {m.label}
            </td>
            {data.map((d) => {
              const tone = m.tone?.(d) ?? "neutral";
              const color =
                tone === "pos"
                  ? "text-[#10b981]"
                  : tone === "neg"
                    ? "text-[#ef4444]"
                    : "";
              return (
                <td
                  key={d.symbol}
                  className={`px-2 py-2 text-right tabular-nums ${color}`}
                >
                  {m.getValue(d)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
