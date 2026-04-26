import { type IChartApi, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { getChartColors } from "@/lib/chart-theme";

export type LightweightChartOptions = {
  timeVisible?: boolean;
  secondsVisible?: boolean;
};

export function useLightweightChart(options: LightweightChartOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { timeVisible = false, secondsVisible = false } = options;

  useEffect(() => {
    if (!containerRef.current) return;
    const { textColor, gridColor } = getChartColors();
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: { timeVisible, secondsVisible },
      rightPriceScale: { borderColor: gridColor },
      // Disable mouse-wheel zoom on the chart. Wheel zoom inside a scroll
      // container is hostile UX (the page can't be scrolled past the chart).
      // Users zoom via the on-chart +/- buttons instead. Pinch-to-zoom on
      // touch and drag-on-axis still work.
      handleScale: {
        mouseWheel: false,
        pinch: true,
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: { time: true, price: true },
      },
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [timeVisible, secondsVisible]);

  return { containerRef, chartRef };
}
