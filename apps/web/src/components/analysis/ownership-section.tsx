import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency as formatCurrencyShared,
  formatDate,
  formatPct,
  formatShares,
} from "@/lib/format";
import { trpc } from "@/lib/trpc";

const formatCurrency = (value: number | null | undefined, currency: string | null = "USD") =>
  formatCurrencyShared(value, currency, { digits: 0 });

const formatPercent = (value: number | null | undefined) =>
  formatPct(value, { signed: true, autoScale: true });

function isAcquisition(ad: string | null): boolean | null {
  if (!ad) return null;
  const s = ad.toLowerCase();
  if (s === "a" || s.includes("acqui")) return true;
  if (s === "d" || s.includes("dispos")) return false;
  return null;
}

function transactionTone(ad: string | null): string {
  const acq = isAcquisition(ad);
  if (acq === true) return "text-emerald-600 dark:text-emerald-400";
  if (acq === false) return "text-red-600 dark:text-red-400";
  return "text-[var(--color-muted-fg)]";
}

function changeTone(change: number | null | undefined): string {
  if (change == null || !Number.isFinite(change)) return "text-[var(--color-muted-fg)]";
  if (change > 0) return "text-emerald-600 dark:text-emerald-400";
  if (change < 0) return "text-red-600 dark:text-red-400";
  return "text-[var(--color-muted-fg)]";
}

export function OwnershipSection({
  symbol,
  collapsed = false,
  onToggleCollapsed,
}: {
  symbol: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useTranslation();

  const insiderQuery = trpc.market.getInsiderTrading.useQuery(
    { symbol, limit: 20 },
    { retry: false, staleTime: 10 * 60_000, enabled: symbol.length > 0 },
  );
  const institutionalQuery = trpc.market.getInstitutionalHolders.useQuery(
    { symbol, limit: 15 },
    { retry: false, staleTime: 10 * 60_000, enabled: symbol.length > 0 },
  );

  const insiders = insiderQuery.data ?? [];
  const institutionals = institutionalQuery.data ?? [];

  const allLoading = insiderQuery.isPending && institutionalQuery.isPending;
  const hasAny = insiders.length > 0 || institutionals.length > 0;

  if (allLoading) return null;
  if (!hasAny) return null;

  const insiderSummary = (() => {
    let buys = 0;
    let sells = 0;
    let buyShares = 0;
    let sellShares = 0;
    for (const row of insiders) {
      const acq = isAcquisition(row.acquisitionOrDisposition);
      const shares = row.securitiesTransacted ?? 0;
      if (acq === true) {
        buys++;
        buyShares += shares;
      } else if (acq === false) {
        sells++;
        sellShares += shares;
      }
    }
    return { buys, sells, buyShares, sellShares };
  })();

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
          <CardTitle className="text-base">{t("ownership.title")}</CardTitle>
        </button>
      </CardHeader>
      {!collapsed && (
      <CardContent className="space-y-5">
        {insiders.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">{t("ownership.insiderTitle")}</h3>
              <div className="text-xs text-[var(--color-muted-fg)]">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {insiderSummary.buys} {t("ownership.buys")}
                </span>
                {" · "}
                <span className="text-red-600 dark:text-red-400">
                  {insiderSummary.sells} {t("ownership.sells")}
                </span>
              </div>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-[var(--color-border)] text-left uppercase tracking-wide text-[var(--color-muted-fg)]">
                  <tr>
                    <th className="py-1.5 pr-3">{t("ownership.colFilingDate")}</th>
                    <th className="py-1.5 pr-3">{t("ownership.colOwner")}</th>
                    <th className="py-1.5 pr-3">{t("ownership.colType")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colShares")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colPrice")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colValue")}</th>
                    <th className="py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {insiders.map((row, i) => (
                    <tr
                      key={`${row.filingDate}-${row.ownerName}-${i}`}
                      className="border-b border-[var(--color-border)]"
                    >
                      <td className="py-1.5 pr-3 text-[var(--color-muted-fg)]">
                        {formatDate(row.filingDate)}
                      </td>
                      <td className="py-1.5 pr-3">
                        <div className="font-medium">{row.ownerName ?? "—"}</div>
                        {row.ownerTitle && (
                          <div className="text-[var(--color-muted-fg)]">{row.ownerTitle}</div>
                        )}
                      </td>
                      <td
                        className={`py-1.5 pr-3 ${transactionTone(row.acquisitionOrDisposition)}`}
                      >
                        {isAcquisition(row.acquisitionOrDisposition) === true
                          ? t("ownership.buy")
                          : isAcquisition(row.acquisitionOrDisposition) === false
                            ? t("ownership.sell")
                            : row.transactionType ?? "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {formatShares(row.securitiesTransacted)}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {row.transactionPrice != null
                          ? formatCurrency(row.transactionPrice, "USD")
                          : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {formatCurrency(row.transactionValue, "USD")}
                      </td>
                      <td className="py-1.5">
                        {row.filingUrl && (
                          <a
                            href={row.filingUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                            aria-label={t("ownership.openFiling")}
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

        {institutionals.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold">{t("ownership.institutionalTitle")}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-[var(--color-border)] text-left uppercase tracking-wide text-[var(--color-muted-fg)]">
                  <tr>
                    <th className="py-1.5 pr-3">{t("ownership.colHolder")}</th>
                    <th className="py-1.5 pr-3">{t("ownership.colAsOf")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colSharesHeld")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colChange")}</th>
                    <th className="py-1.5 pr-3 text-right">{t("ownership.colMarketValue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionals.map((row, i) => (
                    <tr
                      key={`${row.holderName}-${i}`}
                      className="border-b border-[var(--color-border)]"
                    >
                      <td className="py-1.5 pr-3 font-medium">{row.holderName ?? "—"}</td>
                      <td className="py-1.5 pr-3 text-[var(--color-muted-fg)]">
                        {formatDate(row.dateReported)}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {formatShares(row.sharesHeld)}
                      </td>
                      <td
                        className={`py-1.5 pr-3 text-right font-mono tabular-nums ${changeTone(row.sharesChange)}`}
                      >
                        {row.sharesChange != null
                          ? `${row.sharesChange >= 0 ? "+" : ""}${formatShares(Math.abs(row.sharesChange))}`
                          : "—"}
                        {row.sharesChangePercent != null && (
                          <span className="ml-1 text-[var(--color-muted-fg)]">
                            ({formatPercent(row.sharesChangePercent)})
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 text-right font-mono tabular-nums">
                        {formatCurrency(row.marketValue, "USD")}
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
