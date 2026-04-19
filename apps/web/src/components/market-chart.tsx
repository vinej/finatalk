import {
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  HistogramSeries,
  LineSeries,
  type SeriesMarker,
  type SeriesType,
  type Time,
  createChart,
  createSeriesMarkers,
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
  const markersRef = useRef<ISeriesMarkersPluginApi<Time>[]>([]);

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
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    for (const m of markersRef.current) m.detach();
    markersRef.current = [];
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
      const lineColor =
        typeof c === "string"
          ? c
          : c.kind === "macd"
            ? c.line
            : c.kind === "stoch"
              ? c.k
              : c.kind === "adx"
                ? c.adx
                : c.kind === "maCross"
                  ? c.fast
                  : c.bull;

      if (
        r.kind === "sma" ||
        r.kind === "ema" ||
        r.kind === "rma" ||
        r.kind === "wma" ||
        r.kind === "dema" ||
        r.kind === "vwap"
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
      } else if (r.kind === "psar") {
        const s = chart.addSeries(LineSeries, {
          color: lineColor,
          lineWidth: 1,
          lineVisible: false,
          pointMarkersVisible: true,
          pointMarkersRadius: 2,
        });
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (
        r.kind === "rsi" ||
        r.kind === "mom" ||
        r.kind === "roc" ||
        r.kind === "atr" ||
        r.kind === "stochRsi" ||
        r.kind === "williamsR" ||
        r.kind === "obv"
      ) {
        const pane = nextPane++;
        const s = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 2 }, pane);
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "macd") {
        const macdC =
          typeof c === "object" && "line" in c
            ? { line: c.line, signal: c.signal, hist: c.hist }
            : { line: lineColor, signal: lineColor, hist: lineColor };
        const pane = nextPane++;
        const macdLine = chart.addSeries(LineSeries, { color: macdC.line, lineWidth: 2 }, pane);
        const signalLine = chart.addSeries(LineSeries, { color: macdC.signal, lineWidth: 2 }, pane);
        const histo = chart.addSeries(HistogramSeries, { color: macdC.hist }, pane);
        macdLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.macd })));
        signalLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.signal })));
        histo.setData(r.series.map((p) => ({ time: p.time as Time, value: p.histogram })));
        seriesRef.current.push(macdLine, signalLine, histo);
      } else if (r.kind === "stoch") {
        const stochC =
          typeof c === "object" && "k" in c
            ? { k: c.k, d: c.d }
            : { k: lineColor, d: lineColor };
        const pane = nextPane++;
        const kLine = chart.addSeries(LineSeries, { color: stochC.k, lineWidth: 2 }, pane);
        const dLine = chart.addSeries(LineSeries, { color: stochC.d, lineWidth: 2 }, pane);
        kLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.k })));
        dLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.d })));
        seriesRef.current.push(kLine, dLine);
      } else if (r.kind === "adx") {
        const adxC =
          typeof c === "object" && "adx" in c
            ? { adx: c.adx, pdi: c.pdi, mdi: c.mdi }
            : { adx: lineColor, pdi: lineColor, mdi: lineColor };
        const pane = nextPane++;
        const adxLine = chart.addSeries(LineSeries, { color: adxC.adx, lineWidth: 2 }, pane);
        const pdiLine = chart.addSeries(LineSeries, { color: adxC.pdi, lineWidth: 1 }, pane);
        const mdiLine = chart.addSeries(LineSeries, { color: adxC.mdi, lineWidth: 1 }, pane);
        adxLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.adx })));
        pdiLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.pdi })));
        mdiLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.mdi })));
        seriesRef.current.push(adxLine, pdiLine, mdiLine);
      } else if (r.kind === "maCross") {
        const mc =
          typeof c === "object" && c.kind === "maCross"
            ? c
            : { fast: "#2563eb", slow: "#ea580c", bull: "#16a34a", bear: "#dc2626" };
        const isGolden =
          r.spec.maType === "sma" && r.spec.fastPeriod === 50 && r.spec.slowPeriod === 200;
        const fastLine = chart.addSeries(LineSeries, { color: mc.fast, lineWidth: 2 });
        const slowLine = chart.addSeries(LineSeries, { color: mc.slow, lineWidth: 2 });
        fastLine.setData(r.series.fast.map((p) => ({ time: p.time as Time, value: p.value })));
        slowLine.setData(r.series.slow.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(fastLine, slowLine);
        const markers: SeriesMarker<Time>[] = r.series.events.map((ev) => ({
          time: ev.time as Time,
          position: ev.direction === "bull" ? "belowBar" : "aboveBar",
          shape: ev.direction === "bull" ? "arrowUp" : "arrowDown",
          color: ev.direction === "bull" ? mc.bull : mc.bear,
          text: isGolden
            ? ev.direction === "bull"
              ? "Golden Cross"
              : "Death Cross"
            : ev.direction === "bull"
              ? "Bull"
              : "Bear",
        }));
        if (markers.length > 0) {
          markersRef.current.push(createSeriesMarkers(candle, markers));
        }
      } else if (r.kind === "fib") {
        if (r.series) {
          const lineStyles: Record<string, number> = {};
          for (const lvl of r.series.levels) {
            const pct = (lvl.ratio * 100).toFixed(1).replace(/\.0$/, "");
            const isKey = lvl.ratio === 0.382 || lvl.ratio === 0.5 || lvl.ratio === 0.618;
            candle.createPriceLine({
              price: lvl.price,
              color: lineColor,
              lineWidth: isKey ? 2 : 1,
              lineStyle: isKey ? 2 : 3,
              axisLabelVisible: true,
              title: `${pct}%`,
            });
            lineStyles[pct] = isKey ? 2 : 3;
          }
        }
      } else if (r.kind === "macdCross") {
        const mc =
          typeof c === "object" && c.kind === "macdCross"
            ? c
            : { bull: "#16a34a", bear: "#dc2626" };
        const pane = nextPane++;
        const macdLine = chart.addSeries(LineSeries, { color: mc.bull, lineWidth: 2 }, pane);
        const signalLine = chart.addSeries(LineSeries, { color: mc.bear, lineWidth: 2 }, pane);
        const histo = chart.addSeries(HistogramSeries, { color: "#9ca3af" }, pane);
        macdLine.setData(r.series.macd.map((p) => ({ time: p.time as Time, value: p.macd })));
        signalLine.setData(r.series.macd.map((p) => ({ time: p.time as Time, value: p.signal })));
        histo.setData(r.series.macd.map((p) => ({ time: p.time as Time, value: p.histogram })));
        seriesRef.current.push(macdLine, signalLine, histo);
        const markers: SeriesMarker<Time>[] = r.series.events.map((ev) => ({
          time: ev.time as Time,
          position: ev.direction === "bull" ? "belowBar" : "aboveBar",
          shape: ev.direction === "bull" ? "arrowUp" : "arrowDown",
          color: ev.direction === "bull" ? mc.bull : mc.bear,
          text: ev.direction === "bull" ? "MACD ↑" : "MACD ↓",
        }));
        if (markers.length > 0) {
          markersRef.current.push(createSeriesMarkers(candle, markers));
        }
      }
    }

    chart.timeScale().fitContent();
  }, [candles, results, colors]);

  return <div ref={containerRef} className="h-[560px] w-full" />;
}
