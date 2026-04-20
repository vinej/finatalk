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
                  : c.kind === "macdCross"
                    ? c.bull
                    : c.kind === "aroon"
                      ? c.up
                      : c.kind === "vortex"
                        ? c.plus
                        : c.kind === "liqSweep"
                          ? c.highSweep
                          : c.kind === "fvg"
                            ? c.bullish
                            : c.kind === "srLevels"
                              ? c.support
                              : c.kind === "pivots"
                                ? c.pp
                                : c.kind === "volProfile"
                                  ? c.poc
                                  : c.kind === "orderBlock"
                                    ? c.bullish
                                    : c.middle;

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
        r.kind === "obv" ||
        r.kind === "ad" ||
        r.kind === "cmf" ||
        r.kind === "volOsc" ||
        r.kind === "tii" ||
        r.kind === "zscore" ||
        r.kind === "bbPctB" ||
        r.kind === "hurst"
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
      } else if (r.kind === "keltner") {
        const kc =
          typeof c === "object" && c.kind === "keltner"
            ? c
            : { upper: "#0ea5e9", middle: "#0369a1", lower: "#0ea5e9" };
        const upper = chart.addSeries(LineSeries, { color: kc.upper, lineWidth: 1 });
        const middle = chart.addSeries(LineSeries, { color: kc.middle, lineWidth: 1, lineStyle: 2 });
        const lower = chart.addSeries(LineSeries, { color: kc.lower, lineWidth: 1 });
        upper.setData(r.series.map((p) => ({ time: p.time as Time, value: p.upper })));
        middle.setData(r.series.map((p) => ({ time: p.time as Time, value: p.middle })));
        lower.setData(r.series.map((p) => ({ time: p.time as Time, value: p.lower })));
        seriesRef.current.push(upper, middle, lower);
      } else if (r.kind === "donchian") {
        const dc =
          typeof c === "object" && c.kind === "donchian"
            ? c
            : { upper: "#a855f7", middle: "#6b21a8", lower: "#a855f7" };
        const upper = chart.addSeries(LineSeries, { color: dc.upper, lineWidth: 1 });
        const middle = chart.addSeries(LineSeries, { color: dc.middle, lineWidth: 1, lineStyle: 2 });
        const lower = chart.addSeries(LineSeries, { color: dc.lower, lineWidth: 1 });
        upper.setData(r.series.map((p) => ({ time: p.time as Time, value: p.upper })));
        middle.setData(r.series.map((p) => ({ time: p.time as Time, value: p.middle })));
        lower.setData(r.series.map((p) => ({ time: p.time as Time, value: p.lower })));
        seriesRef.current.push(upper, middle, lower);
      } else if (r.kind === "chaikinVol") {
        const pane = nextPane++;
        const s = chart.addSeries(LineSeries, { color: lineColor, lineWidth: 2 }, pane);
        s.setData(r.series.map((p) => ({ time: p.time as Time, value: p.value })));
        seriesRef.current.push(s);
      } else if (r.kind === "aroon") {
        const ac =
          typeof c === "object" && c.kind === "aroon"
            ? c
            : { up: "#16a34a", down: "#dc2626" };
        const pane = nextPane++;
        const upLine = chart.addSeries(LineSeries, { color: ac.up, lineWidth: 2 }, pane);
        const downLine = chart.addSeries(LineSeries, { color: ac.down, lineWidth: 2 }, pane);
        upLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.up })));
        downLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.down })));
        seriesRef.current.push(upLine, downLine);
      } else if (r.kind === "vortex") {
        const vc =
          typeof c === "object" && c.kind === "vortex"
            ? c
            : { plus: "#2563eb", minus: "#ea580c" };
        const pane = nextPane++;
        const plusLine = chart.addSeries(LineSeries, { color: vc.plus, lineWidth: 2 }, pane);
        const minusLine = chart.addSeries(LineSeries, { color: vc.minus, lineWidth: 2 }, pane);
        plusLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.plus })));
        minusLine.setData(r.series.map((p) => ({ time: p.time as Time, value: p.minus })));
        seriesRef.current.push(plusLine, minusLine);
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
      } else if (r.kind === "liqSweep") {
        const lc =
          typeof c === "object" && c.kind === "liqSweep"
            ? c
            : { highSweep: "#dc2626", lowSweep: "#16a34a" };
        const markers: SeriesMarker<Time>[] = r.series.events.map((ev) => ({
          time: ev.time as Time,
          position: ev.type === "high" ? "aboveBar" : "belowBar",
          shape: ev.type === "high" ? "arrowDown" : "arrowUp",
          color: ev.type === "high" ? lc.highSweep : lc.lowSweep,
          text: ev.type === "high" ? "Sweep ↓" : "Sweep ↑",
        }));
        if (markers.length > 0) {
          markersRef.current.push(createSeriesMarkers(candle, markers));
        }
      } else if (r.kind === "fvg") {
        const fc =
          typeof c === "object" && c.kind === "fvg"
            ? c
            : { bullish: "#16a34a", bearish: "#dc2626" };
        const lastTime = candles.at(-1)?.time;
        for (const g of r.series.gaps) {
          const color = g.type === "bullish" ? fc.bullish : fc.bearish;
          const endTime = (g.endTime ?? lastTime ?? g.time) as Time;
          const lineStyle = g.filled ? 2 : 0;
          const topLine = chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            lineStyle,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          const bottomLine = chart.addSeries(LineSeries, {
            color,
            lineWidth: 1,
            lineStyle,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          topLine.setData([
            { time: g.time as Time, value: g.top },
            { time: endTime, value: g.top },
          ]);
          bottomLine.setData([
            { time: g.time as Time, value: g.bottom },
            { time: endTime, value: g.bottom },
          ]);
          seriesRef.current.push(topLine, bottomLine);
        }
        const markers: SeriesMarker<Time>[] = r.series.gaps.map((g) => ({
          time: g.time as Time,
          position: g.type === "bullish" ? "belowBar" : "aboveBar",
          shape: "circle",
          color: g.type === "bullish" ? fc.bullish : fc.bearish,
          text: g.type === "bullish" ? "FVG↑" : "FVG↓",
        }));
        if (markers.length > 0) {
          markersRef.current.push(createSeriesMarkers(candle, markers));
        }
      } else if (r.kind === "srLevels") {
        const sc =
          typeof c === "object" && c.kind === "srLevels"
            ? c
            : { support: "#16a34a", resistance: "#dc2626" };
        for (const lvl of r.series.levels) {
          const color = lvl.type === "support" ? sc.support : sc.resistance;
          const line = chart.addSeries(LineSeries, {
            color,
            lineWidth: Math.min(3, 1 + Math.floor(lvl.touches / 3)) as 1 | 2 | 3,
            lineStyle: 0,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          line.setData([
            { time: r.series.startTime as Time, value: lvl.price },
            { time: r.series.endTime as Time, value: lvl.price },
          ]);
          seriesRef.current.push(line);
        }
      } else if (r.kind === "pivots") {
        const pc =
          typeof c === "object" && c.kind === "pivots"
            ? c
            : { pp: "#6366f1", resistance: "#dc2626", support: "#16a34a" };
        for (const period of r.series.periods) {
          for (const lvl of period.levels) {
            const color = lvl.role === "pp" ? pc.pp : lvl.role === "resistance" ? pc.resistance : pc.support;
            const line = chart.addSeries(LineSeries, {
              color,
              lineWidth: lvl.role === "pp" ? 2 : 1,
              lineStyle: lvl.role === "pp" ? 0 : 2,
              lastValueVisible: false,
              priceLineVisible: false,
            });
            line.setData([
              { time: period.startTime as Time, value: lvl.price },
              { time: period.endTime as Time, value: lvl.price },
            ]);
            seriesRef.current.push(line);
          }
        }
      } else if (r.kind === "volProfile") {
        const vc =
          typeof c === "object" && c.kind === "volProfile"
            ? c
            : { poc: "#f59e0b", valueArea: "#60a5fa", histogram: "#94a3b8" };
        const s = r.series;
        if (s.bins.length > 0) {
          const pocLine = chart.addSeries(LineSeries, {
            color: vc.poc,
            lineWidth: 2,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          pocLine.setData([
            { time: s.startTime as Time, value: s.poc },
            { time: s.endTime as Time, value: s.poc },
          ]);
          seriesRef.current.push(pocLine);
          const vahLine = chart.addSeries(LineSeries, {
            color: vc.valueArea,
            lineWidth: 1,
            lineStyle: 2,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          vahLine.setData([
            { time: s.startTime as Time, value: s.vah },
            { time: s.endTime as Time, value: s.vah },
          ]);
          const valLine = chart.addSeries(LineSeries, {
            color: vc.valueArea,
            lineWidth: 1,
            lineStyle: 2,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          valLine.setData([
            { time: s.startTime as Time, value: s.val },
            { time: s.endTime as Time, value: s.val },
          ]);
          seriesRef.current.push(vahLine, valLine);
          if (r.spec.showHistogram) {
            const maxVol = Math.max(...s.bins.map((b) => b.volume));
            if (maxVol > 0) {
              for (const bin of s.bins) {
                if (bin.volume <= 0) continue;
                const lineWidth = Math.max(1, Math.min(4, Math.round((bin.volume / maxVol) * 4))) as 1 | 2 | 3 | 4;
                const line = chart.addSeries(LineSeries, {
                  color: vc.histogram,
                  lineWidth,
                  lastValueVisible: false,
                  priceLineVisible: false,
                });
                line.setData([
                  { time: s.startTime as Time, value: bin.price },
                  { time: s.endTime as Time, value: bin.price },
                ]);
                seriesRef.current.push(line);
              }
            }
          }
        }
      } else if (r.kind === "orderBlock") {
        const oc =
          typeof c === "object" && c.kind === "orderBlock"
            ? c
            : { bullish: "#16a34a", bearish: "#dc2626" };
        const lastTime = candles.at(-1)?.time;
        for (const b of r.series.blocks) {
          const color = b.type === "bullish" ? oc.bullish : oc.bearish;
          const endTime = (b.endTime ?? lastTime ?? b.time) as Time;
          const lineStyle = b.mitigated ? 2 : 0;
          const topLine = chart.addSeries(LineSeries, {
            color,
            lineWidth: 2,
            lineStyle,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          const bottomLine = chart.addSeries(LineSeries, {
            color,
            lineWidth: 2,
            lineStyle,
            lastValueVisible: false,
            priceLineVisible: false,
          });
          topLine.setData([
            { time: b.time as Time, value: b.top },
            { time: endTime, value: b.top },
          ]);
          bottomLine.setData([
            { time: b.time as Time, value: b.bottom },
            { time: endTime, value: b.bottom },
          ]);
          seriesRef.current.push(topLine, bottomLine);
        }
        const markers: SeriesMarker<Time>[] = r.series.blocks.map((b) => ({
          time: b.time as Time,
          position: b.type === "bullish" ? "belowBar" : "aboveBar",
          shape: "square",
          color: b.type === "bullish" ? oc.bullish : oc.bearish,
          text: b.type === "bullish" ? "OB↑" : "OB↓",
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
