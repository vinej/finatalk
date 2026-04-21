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
    });
    chartRef.current = chart;
    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [timeVisible, secondsVisible]);

  return { containerRef, chartRef };
}
