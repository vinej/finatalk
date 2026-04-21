export function getChartColors() {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    isDark,
    textColor: isDark ? "#e5e7eb" : "#1f2937",
    gridColor: isDark ? "#374151" : "#e5e7eb",
  };
}

export const CHART_PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
  "#06b6d4", "#84cc16", "#e11d48", "#7c3aed",
] as const;

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]!;
}
