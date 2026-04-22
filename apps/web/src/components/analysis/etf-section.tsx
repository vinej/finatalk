import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, formatPct as formatPctShared } from "@/lib/format";
import { trpc } from "@/lib/trpc";

const formatPct = (v: number | null | undefined, digits = 2) =>
  formatPctShared(v, { signed: false, autoScale: true, digits });

const formatEtfCurrency = (v: number | null | undefined, currency: string | null | undefined) =>
  formatCurrency(v, currency, { compact: true });

export function EtfSection({
  symbol,
  assetType,
  collapsed = false,
  onToggleCollapsed,
}: {
  symbol: string;
  assetType?: string | null;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useTranslation();

  const typeKey = (assetType ?? "").toLowerCase();
  // i18n.exists would be cleaner but keeps the surface small.
  const knownTypes = new Set(["stock", "equity", "etf", "mutualfund", "index", "crypto", "commodity", "currency", "future", "option"]);
  const typeLabel = knownTypes.has(typeKey)
    ? t(`etf.assetType.${typeKey}` as const)
    : t("etf.assetType.generic");
  const title = t("etf.performanceDetails", { type: typeLabel });

  const infoQuery = trpc.market.getEtfInfo.useQuery(
    { symbol },
    { retry: false, staleTime: 5 * 60_000, enabled: symbol.length > 0 },
  );
  const holdingsQuery = trpc.market.getEtfHoldings.useQuery(
    { symbol, limit: 10 },
    { retry: false, staleTime: 5 * 60_000, enabled: symbol.length > 0 },
  );
  const sectorsQuery = trpc.market.getEtfSectors.useQuery(
    { symbol },
    { retry: false, staleTime: 5 * 60_000, enabled: symbol.length > 0 },
  );
  const returnsQuery = trpc.market.getHistoricalReturns.useQuery(
    { symbol },
    { retry: false, staleTime: 5 * 60_000, enabled: symbol.length > 0 },
  );

  const info = infoQuery.data;
  const holdings = holdingsQuery.data ?? [];
  const sectors = sectorsQuery.data ?? [];
  const returns = returnsQuery.data;
  const hasPair = (p: { tr: number | null; pr: number | null } | undefined): boolean =>
    !!p && (p.tr != null || p.pr != null);
  const hasTrailingReturns =
    !!returns &&
    (hasPair(returns["6m"]) ||
      hasPair(returns["1y"]) ||
      hasPair(returns["2y"]) ||
      hasPair(returns["5y"]) ||
      hasPair(returns["10y"]));
  const hasYearlyReturns = !!returns && returns.yearly.some((y) => y.tr != null || y.pr != null);
  const hasReturns = hasTrailingReturns || hasYearlyReturns;

  const hasAny = !!info || holdings.length > 0 || sectors.length > 0 || hasReturns;
  const allLoading =
    infoQuery.isPending &&
    holdingsQuery.isPending &&
    sectorsQuery.isPending &&
    returnsQuery.isPending;

  if (allLoading) return null;
  if (!hasAny) return null;

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
          <CardTitle className="text-base">{title}</CardTitle>
        </button>
      </CardHeader>
      {!collapsed && (
      <CardContent className="space-y-5">
        {info && (info.name || info.expenseRatio != null || info.aum != null) && (
          <div>
            {info.name && <p className="text-sm font-semibold">{info.name}</p>}
            {info.issuer && (
              <p className="text-xs text-[var(--color-muted-fg)]">
                {info.issuer}
                {info.category ? ` · ${info.category}` : ""}
              </p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <InfoCell label={t("etf.expenseRatio")} value={formatPct(info.expenseRatio)} />
              <InfoCell label={t("etf.aum")} value={formatEtfCurrency(info.aum, info.currency)} />
              <InfoCell label={t("etf.yield")} value={formatPct(info.yield)} />
              <InfoCell label={t("etf.inception")} value={formatDate(info.inceptionDate)} />
            </div>
            {info.description && (
              <p className="mt-3 text-xs text-[var(--color-muted-fg)]">{info.description}</p>
            )}
          </div>
        )}

        {hasReturns && returns && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t("etf.pastPerformance")}</h3>
            <p className="text-xs text-[var(--color-muted-fg)]">{t("etf.prTrExplainer")}</p>
            {hasTrailingReturns && (
              <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-5">
                <ReturnCell label={t("etf.return6m")} pair={returns["6m"]} />
                <ReturnCell label={t("etf.return1y")} pair={returns["1y"]} />
                <ReturnCell label={t("etf.return2y")} pair={returns["2y"]} />
                <ReturnCell label={t("etf.return5y")} pair={returns["5y"]} />
                <ReturnCell label={t("etf.return10y")} pair={returns["10y"]} />
              </div>
            )}
            {hasYearlyReturns && (
              <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-5">
                {returns.yearly.map((y) => (
                  <ReturnCell
                    key={y.year}
                    label={y.ytd ? `${y.year} ${t("etf.ytd")}` : String(y.year)}
                    pair={{ tr: y.tr, pr: y.pr }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {holdings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold">{t("etf.topHoldings")}</h3>
            <div className="mt-2 space-y-1">
              {holdings.map((h, i) => (
                <div
                  key={`${h.symbol ?? h.name}-${i}`}
                  className="flex items-center justify-between rounded border border-[var(--color-border)] px-3 py-1.5 text-xs"
                >
                  <div className="min-w-0 flex-1 truncate">
                    {h.symbol && <span className="font-medium">{h.symbol}</span>}
                    {h.symbol && h.name ? " · " : ""}
                    <span className="text-[var(--color-muted-fg)]">{h.name}</span>
                  </div>
                  <span className="ml-2 font-mono tabular-nums">{formatPct(h.weight)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sectors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold">{t("etf.sectorBreakdown")}</h3>
            <div className="mt-2 space-y-1.5">
              {sectors.map((s) => (
                <SectorBar key={s.sector} sector={s.sector} weight={s.weight} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-muted-fg)]">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums">{value}</p>
    </div>
  );
}

function ReturnCell({
  label,
  pair,
}: {
  label: string;
  pair: { tr: number | null; pr: number | null };
}) {
  const fmt = (v: number | null) => formatPctShared(v, { signed: true, autoScale: false, digits: 2 });
  const toneOf = (v: number | null) =>
    v == null
      ? "text-[var(--color-muted-fg)]"
      : v >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";
  return (
    <div>
      <p className="text-xs text-[var(--color-muted-fg)]">{label}</p>
      <p className={`mt-0.5 font-mono text-sm tabular-nums ${toneOf(pair.tr)}`}>
        <span className="mr-1 text-[10px] font-semibold uppercase text-[var(--color-muted-fg)]">TR</span>
        {fmt(pair.tr)}
      </p>
      <p className={`font-mono text-xs tabular-nums ${toneOf(pair.pr)} opacity-80`}>
        <span className="mr-1 text-[10px] font-semibold uppercase text-[var(--color-muted-fg)]">PR</span>
        {fmt(pair.pr)}
      </p>
    </div>
  );
}

function SectorBar({ sector, weight }: { sector: string; weight: number }) {
  const pct = Math.abs(weight) <= 1 ? weight * 100 : weight;
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-36 shrink-0 truncate">{sector}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded bg-[var(--color-accent)]">
        <div
          className="absolute inset-y-0 left-0 bg-[var(--color-primary)]"
          style={{ width: `${w}%` }}
        />
      </div>
      <span className="w-12 text-right font-mono tabular-nums">{pct.toFixed(1)}%</span>
    </div>
  );
}
