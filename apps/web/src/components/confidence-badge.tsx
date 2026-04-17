import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ConfidenceBadge({
  level,
  className,
}: {
  level: "high" | "medium" | "low";
  className?: string;
}) {
  const { t } = useTranslation();
  const label =
    level === "high"
      ? t("research.confidenceHigh")
      : level === "low"
        ? t("research.confidenceLow")
        : t("research.confidenceMedium");

  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STYLES[level], className)}
      title={t("research.confidenceTooltip")}
    >
      {label}
    </span>
  );
}
