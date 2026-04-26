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
  onZoomIn,
  onZoomOut,
  onReset,
  zoomInDisabled,
  zoomOutDisabled,
  resetDisabled,
}: {
  chartRef: RefObject<IChartApi | null>;
  className?: string;
  // Optional overrides. When provided, replace the in-chart logical-range zoom
  // — typical use is to step through a range selector (e.g. 1y → 2y → 3y) so
  // zooming out fetches more data instead of just stretching what's loaded.
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  zoomInDisabled?: boolean;
  zoomOutDisabled?: boolean;
  resetDisabled?: boolean;
}) {
  const { t } = useTranslation();
  const btn =
    "flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]/85 text-[var(--color-muted-fg)] backdrop-blur transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--color-bg)]/85 disabled:hover:text-[var(--color-muted-fg)]";
  const handleZoomIn = onZoomIn ?? (() => zoom(chartRef.current, ZOOM_FACTOR));
  const handleZoomOut = onZoomOut ?? (() => zoom(chartRef.current, 1 / ZOOM_FACTOR));
  const handleReset = onReset ?? (() => chartRef.current?.timeScale().fitContent());
  return (
    <div
      className={cn("absolute left-2 top-2 z-10 flex items-center gap-1", className)}
      role="toolbar"
      aria-label={t("chart.zoomControls")}
    >
      <button
        type="button"
        className={btn}
        onClick={handleZoomIn}
        disabled={zoomInDisabled}
        title={t("chart.zoomIn")}
        aria-label={t("chart.zoomIn")}
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={handleZoomOut}
        disabled={zoomOutDisabled}
        title={t("chart.zoomOut")}
        aria-label={t("chart.zoomOut")}
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={handleReset}
        disabled={resetDisabled}
        title={t("chart.fit")}
        aria-label={t("chart.fit")}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
