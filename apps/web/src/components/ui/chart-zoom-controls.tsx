import type { IChartApi } from "lightweight-charts";
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

const ZOOM_FACTOR = 0.7;

function zoom(chart: IChartApi | null, factor: number): void {
  if (!chart) return;
  const ts = chart.timeScale();
  const range = ts.getVisibleLogicalRange();
  if (!range) return;
  const center = (range.from + range.to) / 2;
  const half = (range.to - range.from) / 2;
  const newHalf = Math.max(2, half * factor);
  ts.setVisibleLogicalRange({ from: center - newHalf, to: center + newHalf });
}

export function ChartZoomControls({
  chartRef,
  className,
}: {
  chartRef: RefObject<IChartApi | null>;
  className?: string;
}) {
  const { t } = useTranslation();
  const btn =
    "flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]/85 text-[var(--color-muted-fg)] backdrop-blur transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";
  return (
    <div
      className={cn("absolute left-2 top-2 z-10 flex items-center gap-1", className)}
      role="toolbar"
      aria-label={t("chart.zoomControls")}
    >
      <button
        type="button"
        className={btn}
        onClick={() => zoom(chartRef.current, ZOOM_FACTOR)}
        title={t("chart.zoomIn")}
        aria-label={t("chart.zoomIn")}
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => zoom(chartRef.current, 1 / ZOOM_FACTOR)}
        title={t("chart.zoomOut")}
        aria-label={t("chart.zoomOut")}
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => chartRef.current?.timeScale().fitContent()}
        title={t("chart.fit")}
        aria-label={t("chart.fit")}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
