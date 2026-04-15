import {
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  HistogramSeries,
  LineSeries,
  type SeriesType,
  type Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { RouterOutputs } from "@finatalk/trpc";

type Analyze = RouterOutputs["market"]["analyze"];
export type Candle = Analyze["candles"][number];
export type IndicatorResult = Analyze["results"][number];

const OVERLAY_COLORS = ["#2563eb", "#16a34a", "#db2777", "#ca8a04", "#9333ea"];

export function MarketChart({ candles, results }: { candles: Candle[]; results: IndicatorResult[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<SeriesType>[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#e5e7eb" : "#1f2937";
    const gridColor = isDark ? "#374151" : "#e5e7eb";
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
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

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });
    candle.setData(
      candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );
    seriesRef.current.push(candle);

    let nextPane = 1;
    let overlayColorIdx = 0;
    const nextOverlayColor = () => OVERLAY_COLORS[overlayColorIdx++ % OVERLAY_COLORS.length];

    for (const r of results) {
      if (r.kind === "sma" || r.kind === "ema") {
        const s = chart.addSeries(LineSeries, { color: nextOverlayColor(), lineWidth: 2 });
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "bbands") {
        const color = nextOverlayColor();
        const upper = chart.addSeries(LineSeries, { color, lineWidth: 1 });
        const middle = chart.addSeries(LineSeries, { color, lineWidth: 1, lineStyle: 2 });
        const lower = chart.addSeries(LineSeries, { color, lineWidth: 1 });
        upper.setData(r.series.map((p) => ({ time: p.time as Time, value: p.upper })));
        middle.setData(r.series.map((p) => ({ time: p.time as Time, value: p.middle })));
        lower.setData(r.series.map((p) => ({ time: p.time as Time, value: p.lower })));
        seriesRef.current.push(upper, middle, lower);
      } else if (r.kind === "rsi") {
        const pane = nextPane++;
        const s = chart.addSeries(LineSeries, { color: "#7c3aed", lineWidth: 2 }, pane);
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "macd") {
        const pane = nextPane++;
        const macdLine = chart.addSeries(LineSeries, { color: "#2563eb", lineWidth: 2 }, pane);
        const signalLine = chart.addSeries(LineSeries, { color: "#dc2626", lineWidth: 2 }, pane);
        const histo = chart.addSeries(HistogramSeries, { color: "#9ca3af" }, pane);
        macdLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.macd })));
        signalLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.signal })));
        histo.setData(r.series.map((p) => ({ time: p.time as Time, value: p.histogram })));
        seriesRef.current.push(macdLine, signalLine, histo);
      }
    }

    chart.timeScale().fitContent();
  }, [candles, results]);

  return <div ref={containerRef} className="h-[560px] w-full" />;
}
