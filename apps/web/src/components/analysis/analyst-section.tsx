import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function formatCurrency(value: number | null | undefined, currency: string | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  const ccy = currency ?? "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${ccy} ${value.toLocaleString()}`;
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function ratingTone(rating: string | null): string {
  if (!rating) return "text-[var(--color-muted-fg)]";
  const r = rating.toLowerCase();
  if (r.includes("buy") || r.includes("outperform") || r.includes("overweight")) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (r.includes("sell") || r.includes("underperform") || r.includes("underweight")) {
    return "text-red-600 dark:text-red-400";
  }
  if (r.includes("hold") || r.includes("neutral") || r.includes("equal")) {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-[var(--color-muted-fg)]";
}

function actionTone(action: string | null): string {
  if (!action) return "text-[var(--color-muted-fg)]";
  const a = action.toLowerCase();
  if (a.includes("upgrade") || a.includes("raises") || a.includes("initiat")) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (a.includes("downgrade") || a.includes("lowers")) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-[var(--color-muted-fg)]";
}

export function AnalystSection({
  symbol,
  collapsed = false,
  onToggleCollapsed,
}: {
  symbol: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useTranslation();

  const consensusQuery = trpc.market.getAnalystConsensus.useQuery(
    { symbol },
    { retry: false, staleTime: 10 * 60_000, enabled: symbol.length > 0 },
  );
  const targetsQuery = trpc.market.getPriceTargets.useQuery(
    { symbol, limit: 10 },
    { retry: false, staleTime: 10 * 60_000, enabled: symbol.length > 0 },
  );

  const consensus = consensusQuery.data;
  const targets = targetsQuery.data ?? [];

  const hasAny = !!consensus || targets.length > 0;
  const allLoading = consensusQuery.isPending && targetsQuery.isPending;

  if (allLoading) return null;
  if (!hasAny) return null;

  const upsidePct =
    consensus?.targetMean != null && consensus.currentPrice && consensus.currentPrice > 0
      ? ((consensus.targetMean - consensus.currentPrice) / consensus.currentPrice) * 100
      : null;

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
          <CardTitle className="text-base">{t("analyst.title")}</CardTitle>
        </button>
      </CardHeader>
      {!collapsed && (
      <CardContent className="space-y-5">
        {consensus && (
          <div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <InfoCell
                label={t("analyst.targetMean")}
                value={formatCurrency(consensus.targetMean, consensus.currency)}
                sub={
                  upsidePct != null
                    ? `${upsidePct >= 0 ? "+" : ""}${upsidePct.toFixed(1)}%`
                    : undefined
                }
                subTone={
                  upsidePct == null
                    ? undefined
                    : upsidePct >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                }
              />
              <InfoCell
                label={t("analyst.targetRange")}
                value={`${formatCurrency(consensus.targetLow, consensus.currency)} – ${formatCurrency(consensus.targetHigh, consensus.currency)}`}
              />
              <InfoCell
                label={t("analyst.consensus")}
                value={consensus.recommendation ?? "—"}
                valueTone={ratingTone(consensus.recommendation)}
              />
              <InfoCell
                label={t("analyst.numAnalysts")}
                value={consensus.numberOfAnalysts != null ? String(consensus.numberOfAnalysts) : "—"}
              />
            </div>
          </div>
        )}

        {targets.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold">{t("analyst.recentTargets")}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-[var(--color-border)] text-left uppercase tracking-wide text-[var(--color-muted-fg)]">
                  <tr>
                    <th className="py-1.5 pr-3">{t("analyst.colDate")}</th>
                    <th className="py-1.5 pr-3">{t("analyst.colFirm")}</th>
                    <th className="py-1.5 pr-3">{t("analyst.colAction")}</th>
                    <th className="py-1.5 pr-3">{t("analyst.colRating")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("analyst.colTarget")}</th>
                    <th className="py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((tgt, i) => (
                    <tr key={`${tgt.publishedDate}-${tgt.analystFirm}-${i}`} className="border-b border-[var(--color-border)]">
                      <td className="py-1.5 pr-3 text-[var(--color-muted-fg)]">{formatDate(tgt.publishedDate)}</td>
                      <td className="py-1.5 pr-3">
                        <div className="font-medium">{tgt.analystFirm ?? "—"}</div>
                        {tgt.analystName && (
                          <div className="text-[var(--color-muted-fg)]">{tgt.analystName}</div>
                        )}
                      </td>
                      <td className={`py-1.5 pr-3 ${actionTone(tgt.action)}`}>{tgt.action ?? "—"}</td>
                      <td className={`py-1.5 pr-3 ${ratingTone(tgt.ratingCurrent)}`}>
                        {tgt.ratingCurrent ?? "—"}
                        {tgt.ratingPrevious && tgt.ratingPrevious !== tgt.ratingCurrent && (
                          <span className="ml-1 text-[var(--color-muted-fg)]">
                            (← {tgt.ratingPrevious})
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {formatCurrency(tgt.priceTarget, tgt.currency)}
                        {tgt.priceTargetPrevious != null && tgt.priceTargetPrevious !== tgt.priceTarget && (
                          <span className="ml-1 text-[var(--color-muted-fg)]">
                            (← {formatCurrency(tgt.priceTargetPrevious, tgt.currency)})
                          </span>
                        )}
                      </td>
                      <td className="py-1.5">
                        {tgt.url && (
                          <a
                            href={tgt.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                            aria-label={t("analyst.openLink")}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
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
