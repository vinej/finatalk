import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNum, formatPct, formatShares } from "@/lib/format";
import { trpc } from "@/lib/trpc";

const formatDays = (value: number | null | undefined) => formatNum(value, 2);

function changeTone(change: number | null | undefined): string {
  if (change == null || !Number.isFinite(change)) return "text-[var(--color-muted-fg)]";
  if (change > 0) return "text-red-600 dark:text-red-400";
  if (change < 0) return "text-emerald-600 dark:text-emerald-400";
  return "text-[var(--color-muted-fg)]";
}

const formatPercent = (value: number | null | undefined) =>
  formatPct(value, { signed: true, autoScale: true });

export function ShortInterestSection({
  symbol,
  collapsed = false,
  onToggleCollapsed,
}: {
  symbol: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useTranslation();

  const query = trpc.market.getShortInterest.useQuery(
    { symbol },
    { retry: false, staleTime: 10 * 60_000, enabled: symbol.length > 0 },
  );

  const sorted = useMemo(() => {
    const rows = query.data ?? [];
    return [...rows].sort((a, b) => {
      const ta = a.settlementDate ? new Date(a.settlementDate).getTime() : 0;
      const tb = b.settlementDate ? new Date(b.settlementDate).getTime() : 0;
      return tb - ta;
    });
  }, [query.data]);

  if (query.isPending) return null;
  if (sorted.length === 0) return null;

  const latest = sorted[0]!;
  const previous = sorted[1];
  const siChangePct =
    latest.changePercent ??
    (latest.shortInterest != null && previous?.shortInterest
      ? ((latest.shortInterest - previous.shortInterest) / previous.shortInterest) * 100
      : null);
  const recent = sorted.slice(0, 12);

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[var(--color-accent)]"
          aria-expanded={!collapsed}
          title={collapsed ? t("analysis.expand") : t("analysis.collapse")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          )}
          <CardTitle className="text-base">{t("shortInterest.title")}</CardTitle>
        </button>
      </CardHeader>
      {!collapsed && (
      <CardContent className="space-y-5">
        <div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <InfoCell
              label={t("shortInterest.latestSettlement")}
              value={formatDate(latest.settlementDate)}
            />
            <InfoCell
              label={t("shortInterest.shortInterest")}
              value={formatShares(latest.shortInterest)}
              sub={siChangePct != null ? formatPercent(siChangePct) : undefined}
              subTone={
                siChangePct == null
                  ? undefined
                  : siChangePct > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
              }
            />
            <InfoCell
              label={t("shortInterest.daysToCover")}
              value={formatDays(latest.daysToCover)}
            />
            <InfoCell
              label={t("shortInterest.avgDailyVolume")}
              value={formatShares(latest.averageDailyVolume)}
            />
          </div>
        </div>

        {recent.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold">{t("shortInterest.history")}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-[var(--color-border)] text-left uppercase tracking-wide text-[var(--color-muted-fg)]">
                  <tr>
                    <th className="py-1.5 pr-3">{t("shortInterest.colSettlement")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("shortInterest.colShortInterest")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("shortInterest.colChange")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("shortInterest.colDaysToCover")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("shortInterest.colAvgDailyVolume")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row, i) => {
                    const next = recent[i + 1];
                    const rowChangePct =
                      row.changePercent ??
                      (row.shortInterest != null && next?.shortInterest
                        ? ((row.shortInterest - next.shortInterest) / next.shortInterest) * 100
                        : null);
                    return (
                      <tr
                        key={`${row.settlementDate}-${i}`}
                        className="border-b border-[var(--color-border)]"
                      >
                        <td className="py-1.5 pr-3 text-[var(--color-muted-fg)]">
                          {formatDate(row.settlementDate)}
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                          {formatShares(row.shortInterest)}
                        </td>
                        <td
                          className={`py-1.5 pr-3 text-right font-mono tabular-nums ${changeTone(rowChangePct)}`}
                        >
                          {rowChangePct != null ? formatPercent(rowChangePct) : "—"}
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                          {formatDays(row.daysToCover)}
                        </td>
                        <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                          {formatShares(row.averageDailyVolume)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}

function InfoCell({
  label,
  value,
  sub,
  valueTone,
  subTone,
}: {
  label: string;
  value: string;
  sub?: string;
  valueTone?: string;
  subTone?: string;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted-fg)]">{label}</p>
      <p className={`mt-0.5 font-mono text-sm tabular-nums ${valueTone ?? ""}`}>{value}</p>
      {sub && <p className={`text-xs ${subTone ?? "text-[var(--color-muted-fg)]"}`}>{sub}</p>}
    </div>
  );
}
