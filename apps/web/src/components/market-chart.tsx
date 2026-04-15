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
import { CANDLE_DOWN, CANDLE_UP, type IndicatorColor } from "@/lib/indicator-legend";

type Analyze = RouterOutputs["market"]["analyze"];
export type Candle = Analyze["candles"][number];
export type IndicatorResult = Analyze["results"][number];

export function MarketChart({
  candles,
  results,
  colors,
}: {
  candles: Candle[];
  results: IndicatorResult[];
  colors: IndicatorColor[];
}) {
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
      upColor: CANDLE_UP,
      downColor: CANDLE_DOWN,
      borderUpColor: CANDLE_UP,
      borderDownColor: CANDLE_DOWN,
      wickUpColor: CANDLE_UP,
      wickDownColor: CANDLE_DOWN,
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

    for (let i = 0; i < results.length; i++) {
      const r = results[i]!;
      const c = colors[i] ?? "#2563eb";
      const lineColor = typeof c === "string" ? c : c.line;

      if (
        r.kind === "sma" ||
        r.kind === "ema" ||
        r.kind === "rma" ||
        r.kind === "wma" ||
        r.kind === "dema"
      ) {
        const s = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 2 });
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "bbands") {
        const upper = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 1 });
        const middle = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 1, lineStyle: 2 });
        const lower = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 1 });
        upper.setData(r.series.map((p) => ({ time: p.time as Time, value: p.upper })));
        middle.setData(r.series.map((p) => ({ time: p.time as Time, value: p.middle })));
        lower.setData(r.series.map((p) => ({ time: p.time as Time, value: p.lower })));
        seriesRef.current.push(upper, middle, lower);
      } else if (r.kind === "rsi" || r.kind === "mom" || r.kind === "roc") {
        const pane = nextPane++;
        const s = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 2 }, pane);
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "macd") {
        const macdC =
          typeof c === "string"
            ? { line: c, signal: c, hist: c }
            : { line: c.line, signal: c.signal, hist: c.hist };
        const pane = nextPane++;
        const macdLine = chart.addSeries(LineSeries, { color: macdC.line, lineWidth: 2 }, pane);
        const signalLine = chart.addSeries(LineSeries, { color: macdC.signal, lineWidth: 2 }, pane);
        const histo = chart.addSeries(HistogramSeries, { color: macdC.hist }, pane);
        macdLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.macd })));
        signalLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.signal })));
        histo.setData(r.series.map((p) => ({ time: p.time as Time, value: p.histogram })));
        seriesRef.current.push(macdLine, signalLine, histo);
      }
    }

    chart.timeScale().fitContent();
  }, [candles, results, colors]);

  return <div ref={containerRef} className="h-[560px] w-full" />;
}
