import {
  type ISeriesApi,
  LineSeries,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EquityPoint } from "@/lib/backtest-engine";
import { useLightweightChart } from "@/lib/use-lightweight-chart";

export function EquityCurveCard({
  equity,
  benchmark,
}: {
  equity: EquityPoint[];
  benchmark: EquityPoint[];
}) {
  const { t } = useTranslation();
  const { containerRef, chartRef } = useLightweightChart();
  const equitySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    equitySeriesRef.current = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
      title: "Strategy",
    });
    benchmarkSeriesRef.current = chart.addSeries(LineSeries, {
      color: "#94a3b8",
      lineWidth: 1,
      lineStyle: 2,
      title: "Buy & Hold",
    });
    return () => {
      equitySeriesRef.current = null;
      benchmarkSeriesRef.current = null;
    };
  }, [chartRef]);

  useEffect(() => {
    const eq = equitySeriesRef.current;
    const bm = benchmarkSeriesRef.current;
    if (!eq || !bm) return;
    const toSeries = (pts: Array<{ time: number; equity: number }>) => {
      const byTime = new Map<number, number>();
      for (const p of pts) byTime.set(p.time, p.equity);
      return [...byTime.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([time, value]) => ({ time: time as Time, value }));
    };
    eq.setData(toSeries(equity));
    bm.setData(toSeries(benchmark));
    chartRef.current?.timeScale().fitContent();
  }, [equity, benchmark]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{t("backtest.equityCurve")}</CardTitle>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted-fg)]">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-[#2563eb]" /> {t("backtest.legendStrategy")}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-[#94a3b8]" /> {t("backtest.legendBenchmark")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}
