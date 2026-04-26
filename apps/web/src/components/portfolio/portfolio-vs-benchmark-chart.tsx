import {
  type ISeriesApi,
  LineSeries,
  type Time,
} from "lightweight-charts";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getChartColors } from "@/lib/chart-theme";
import { trpc } from "@/lib/trpc";
import { ChartZoomControls } from "@/components/ui/chart-zoom-controls";
import { OptionsSelect } from "@/components/ui/options-select";
import { useLightweightChart } from "@/lib/use-lightweight-chart";
import {
  PERFORMANCE_RANGES,
  type PerformanceRange,
} from "@/components/portfolio/portfolio-performance-chart";

export type BenchmarkKey = "sp500" | "nasdaq" | "dowjones" | "tsx" | "tsx60";

export const BENCHMARKS: {
  key: BenchmarkKey;
  labelKey: string;
  yahooSymbol: string;
  color: string;
}[] = [
  { key: "sp500", labelKey: "indices.sp500", yahooSymbol: "^GSPC", color: "#3b82f6" },
  { key: "nasdaq", labelKey: "indices.nasdaq", yahooSymbol: "^NDX", color: "#10b981" },
  { key: "dowjones", labelKey: "indices.dowjones", yahooSymbol: "^DJI", color: "#f59e0b" },
  { key: "tsx", labelKey: "indices.tsx", yahooSymbol: "^GSPTSE", color: "#ef4444" },
  { key: "tsx60", labelKey: "indices.tsx60", yahooSymbol: "XIU.TO", color: "#8b5cf6" },
];

export type PortfolioHolding = { symbol: string; quantity: number };

export function PortfolioVsBenchmarkChart({
  holdings,
  currency,
  range,
  onRangeChange,
  selected,
  onSelectedChange,
}: {
  holdings: PortfolioHolding[];
  currency: string;
  range: PerformanceRange;
  onRangeChange: (range: PerformanceRange) => void;
  selected: BenchmarkKey[];
  onSelectedChange: (next: BenchmarkKey[]) => void;
}) {
  const { t } = useTranslation();

  const convertTo = currency === "CAD" ? ("CAD" as const) : null;

  const holdingQueries = trpc.useQueries((tr) =>
    holdings.map((h) =>
      tr.market.candles(
        { symbol: h.symbol, range, interval: "1d", convertTo },
        { staleTime: 60_000, retry: false },
      ),
    ),
  );

  const activeBenchmarks = useMemo(
    () => BENCHMARKS.filter((b) => selected.includes(b.key)),
    [selected],
  );

  const benchmarkQueries = trpc.useQueries((tr) =>
    activeBenchmarks.map((b) =>
      tr.market.candles(
        { symbol: b.yahooSymbol, range, interval: "1d", convertTo },
        { staleTime: 60_000, retry: false },
      ),
    ),
  );

  const portfolioPoints = useMemo(() => {
    if (holdings.length === 0) return [] as { time: Time; value: number }[];

    type PriceMap = Map<number, number>;
    const priceMaps: PriceMap[] = [];
    const allTimes = new Set<number>();

    for (let i = 0; i < holdings.length; i++) {
      const candles = holdingQueries[i]?.data?.candles ?? [];
      const m: PriceMap = new Map();
      for (const c of candles) {
        const t = c.time as unknown as number;
        m.set(t, c.close);
        allTimes.add(t);
      }
      priceMaps.push(m);
    }

    if (allTimes.size === 0) return [];

    const sortedTimes = [...allTimes].sort((a, b) => a - b);
    const lastKnown = new Array<number | null>(holdings.length).fill(null);
    const points: { time: Time; value: number }[] = [];

    for (const t of sortedTimes) {
      let total = 0;
      let ready = true;
      for (let i = 0; i < holdings.length; i++) {
        const p = priceMaps[i]!.get(t);
        if (p != null && Number.isFinite(p)) {
          lastKnown[i] = p;
        }
        const price = lastKnown[i];
        if (price == null) {
          ready = false;
          break;
        }
        total += holdings[i]!.quantity * price;
      }
      if (!ready || !Number.isFinite(total) || total <= 0) continue;
      points.push({ time: t as Time, value: total });
    }

    if (points.length === 0) return [];
    const base = points[0]!.value;
    if (!Number.isFinite(base) || base === 0) return [];
    return points.map((p) => ({ time: p.time, value: (p.value / base) * 100 }));
  }, [holdings, holdingQueries]);

  const benchmarkSeries = useMemo(() => {
    return activeBenchmarks.map((b, i) => {
      const candles = benchmarkQueries[i]?.data?.candles ?? [];
      if (candles.length === 0) return { benchmark: b, points: [] as { time: Time; value: number }[] };
      const base = candles[0]!.close;
      if (!Number.isFinite(base) || base === 0) {
        return { benchmark: b, points: [] as { time: Time; value: number }[] };
      }
      const points = candles.map((c) => ({
        time: c.time as Time,
        value: (c.close / base) * 100,
      }));
      return { benchmark: b, points };
    });
  }, [activeBenchmarks, benchmarkQueries]);

  const { containerRef, chartRef } = useLightweightChart();
  const seriesRef = useRef<ISeriesApi<"Line">[]>([]);
  const portfolioColorRef = useRef<string>("#111827");

  useEffect(() => {
    portfolioColorRef.current = getChartColors().isDark ? "#f9fafb" : "#111827";
    return () => {
      seriesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    for (const s of seriesRef.current) chart.removeSeries(s);
    seriesRef.current = [];

    if (portfolioPoints.length > 0) {
      const s = chart.addSeries(LineSeries, {
        color: portfolioColorRef.current,
        lineWidth: 3,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(portfolioPoints);
      seriesRef.current.push(s);
    }

    for (const { benchmark, points } of benchmarkSeries) {
      if (points.length === 0) continue;
      const s = chart.addSeries(LineSeries, {
        color: benchmark.color,
        lineWidth: 2,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(points);
      seriesRef.current.push(s);
    }

    if (seriesRef.current.length > 0) chart.timeScale().fitContent();
  }, [portfolioPoints, benchmarkSeries]);

  const anyLoading =
    holdingQueries.some((q) => q.isLoading) || benchmarkQueries.some((q) => q.isLoading);
  const hasData = portfolioPoints.length > 0 || benchmarkSeries.some((b) => b.points.length > 0);

  const portfolioReturn = useMemo(() => {
    if (portfolioPoints.length === 0) return null;
    const last = portfolioPoints[portfolioPoints.length - 1]!.value;
    if (!Number.isFinite(last)) return null;
    return last - 100;
  }, [portfolioPoints]);

  const benchmarkReturns = useMemo(() => {
    return benchmarkSeries.map(({ benchmark, points }) => {
      if (points.length === 0) return { benchmark, returnPct: null as number | null };
      const last = points[points.length - 1]!.value;
      return { benchmark, returnPct: Number.isFinite(last) ? last - 100 : null };
    });
  }, [benchmarkSeries]);

  function toggleBenchmark(key: BenchmarkKey) {
    if (selected.includes(key)) {
      onSelectedChange(selected.filter((k) => k !== key));
    } else {
      onSelectedChange([...selected, key]);
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <label htmlFor="bench-range" className="text-xs text-[var(--color-muted-fg)]">
          {t("analysis.range")}
        </label>
        <OptionsSelect
          id="bench-range"
          size="xs"
          value={range}
          onChange={onRangeChange}
          options={PERFORMANCE_RANGES}
        />
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {BENCHMARKS.map((b) => {
          const active = selected.includes(b.key);
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => toggleBenchmark(b.key)}
              className={
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors " +
                (active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] hover:bg-[var(--color-accent)]/40")
              }
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              {t(b.labelKey)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative h-64 w-full">
          <div ref={containerRef} className="h-full w-full" />
          <ChartZoomControls chartRef={chartRef} />
        </div>

        <div className="rounded-md border border-[var(--color-border)] p-3">
          <div className="mb-2 text-xs font-medium text-[var(--color-muted-fg)]">
            {t("portfolio.benchmarkSummaryTitle")}
          </div>
          <PerfRow
            color={portfolioColorRef.current}
            label={t("portfolio.benchmarkPortfolioLabel")}
            returnPct={portfolioReturn}
            bold
          />
          {benchmarkReturns.length === 0 ? (
            <p className="mt-2 text-[11px] text-[var(--color-muted-fg)]">
              {t("portfolio.benchmarkNoneSelected")}
            </p>
          ) : (
            benchmarkReturns.map(({ benchmark, returnPct }) => (
              <PerfRow
                key={benchmark.key}
                color={benchmark.color}
                label={t(benchmark.labelKey)}
                returnPct={returnPct}
              />
            ))
          )}
        </div>
      </div>

      {!anyLoading && !hasData && (
        <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
          {t("portfolio.performanceNoData")}
        </p>
      )}
      <p className="mt-1 text-[10px] text-[var(--color-muted-fg)]">
        {t("portfolio.benchmarkHint")}
      </p>
    </div>
  );
}

function PerfRow({
  color,
  label,
  returnPct,
  bold,
}: {
  color: string;
  label: string;
  returnPct: number | null;
  bold?: boolean;
}) {
  const formatted =
    returnPct == null || !Number.isFinite(returnPct)
      ? "—"
      : `${returnPct > 0 ? "+" : ""}${returnPct.toFixed(2)}%`;
  const tone =
    returnPct == null || !Number.isFinite(returnPct)
      ? "text-[var(--color-muted-fg)]"
      : returnPct >= 0
        ? "text-[#10b981]"
        : "text-[#ef4444]";
  return (
    <div className="flex items-center justify-between gap-2 py-1 text-xs">
      <span className="inline-flex items-center gap-1.5 min-w-0">
        <span
          aria-hidden
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className={(bold ? "font-semibold " : "") + "truncate text-[var(--color-fg)]"}>
          {label}
        </span>
      </span>
      <span className={"tabular-nums " + tone + (bold ? " font-semibold" : "")}>{formatted}</span>
    </div>
  );
}
