import {
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  type Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
type Range = (typeof RANGES)[number];

export type PerformanceItem = { symbol: string; color: string };

export function PortfolioPerformanceChart({
  items,
  currency,
}: {
  items: PerformanceItem[];
  currency: string;
}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("6mo");

  const convertTo = currency === "CAD" ? ("CAD" as const) : null;

  const queries = trpc.useQueries((tr) =>
    items.map((it) =>
      tr.market.candles(
        { symbol: it.symbol, range, interval: "1d", convertTo },
        { staleTime: 60_000, retry: false },
      ),
    ),
  );

  const seriesData = useMemo(() => {
    return items.map((it, i) => {
      const candles = queries[i]?.data?.candles ?? [];
      if (candles.length === 0) return { item: it, points: [] as { time: Time; value: number }[] };
      const base = candles[0]!.close;
      if (!Number.isFinite(base) || base === 0) {
        return { item: it, points: [] as { time: Time; value: number }[] };
      }
      const points = candles.map((c) => ({
        time: c.time as Time,
        value: (c.close / base) * 100,
      }));
      return { item: it, points };
    });
  }, [items, queries]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line">[]>([]);

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
    for (const { item, points } of seriesData) {
      if (points.length === 0) continue;
      const s = chart.addSeries(LineSeries, {
        color: item.color,
        lineWidth: 2,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(points);
      seriesRef.current.push(s);
    }
    if (seriesRef.current.length > 0) chart.timeScale().fitContent();
  }, [seriesData]);

  const anyLoading = queries.some((q) => q.isLoading);
  const hasData = seriesData.some((s) => s.points.length > 0);

  return (
    <div className="mt-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium text-[var(--color-muted-fg)]">
          {t("portfolio.performanceTitle")}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="perf-range" className="text-xs text-[var(--color-muted-fg)]">
            {t("analysis.range")}
          </label>
          <select
            id="perf-range"
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="h-7 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-xs"
          >
            {RANGES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div ref={containerRef} className="h-64 w-full" />
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {items.map((it) => (
          <span key={it.symbol} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: it.color }}
            />
            <span className="text-[var(--color-fg)]">{it.symbol}</span>
          </span>
        ))}
      </div>
      {!anyLoading && !hasData && (
        <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
          {t("portfolio.performanceNoData")}
        </p>
      )}
      <p className="mt-1 text-[10px] text-[var(--color-muted-fg)]">
        {t("portfolio.performanceHint")}
      </p>
    </div>
  );
}
