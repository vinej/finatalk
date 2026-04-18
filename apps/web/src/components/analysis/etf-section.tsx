import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

function formatPct(value: number | null | undefined, digits = 2) {
  if (value == null || !Number.isFinite(value)) return "—";
  const v = Math.abs(value) <= 1 ? value * 100 : value;
  return `${v.toFixed(digits)}%`;
}

function formatCurrency(value: number | null | undefined, currency: string | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  const ccy = currency ?? "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      notation: value >= 1_000_000 ? "compact" : "standard",
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

export function EtfSection({
  symbol,
  collapsed = false,
  onToggleCollapsed,
}: {
  symbol: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { t } = useTranslation();

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

  const info = infoQuery.data;
  const holdings = holdingsQuery.data ?? [];
  const sectors = sectorsQuery.data ?? [];

  const hasAny = !!info || holdings.length > 0 || sectors.length > 0;
  const allLoading = infoQuery.isPending && holdingsQuery.isPending && sectorsQuery.isPending;

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
          <CardTitle className="text-base">{t("etf.title")}</CardTitle>
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
              <InfoCell label={t("etf.aum")} value={formatCurrency(info.aum, info.currency)} />
              <InfoCell label={t("etf.yield")} value={formatPct(info.yield)} />
              <InfoCell label={t("etf.inception")} value={formatDate(info.inceptionDate)} />
            </div>
            {info.description && (
              <p className="mt-3 text-xs text-[var(--color-muted-fg)]">{info.description}</p>
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
