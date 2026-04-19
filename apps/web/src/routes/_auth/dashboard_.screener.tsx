import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import {
  loadScreenerState,
  saveScreenerState,
  type PersistedScreenerRow,
} from "@/lib/screener-persistence";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/screener")({
  component: ScreenerPage,
});

type SortKey = "symbol" | "lastClose" | "rsi" | "sma50" | "sma200" | "change1d";

function formatNum(v: number | null, decimals = 2) {
  if (v == null || !Number.isFinite(v)) return "—";
  return v.toFixed(decimals);
}

function formatPct(v: number | null) {
  if (v == null || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function ScreenerPage() {
  const { t } = useTranslation();

  const persisted = useMemo(() => loadScreenerState(), []);
  const [source, setSource] = useState<"portfolio" | "watchlist" | "custom">(persisted?.source ?? "portfolio");
  const [customSymbols, setCustomSymbols] = useState(persisted?.customSymbols ?? "");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>(persisted?.assetTypeFilter ?? "all");
  const [exchangeFilter, setExchangeFilter] = useState<string>(persisted?.exchangeFilter ?? "all");

  const [priceMin, setPriceMin] = useState(persisted?.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(persisted?.priceMax ?? "");
  const [rsiMin, setRsiMin] = useState(persisted?.rsiMin ?? "");
  const [rsiMax, setRsiMax] = useState(persisted?.rsiMax ?? "");
  const [rsiPeriod, setRsiPeriod] = useState(persisted?.rsiPeriod ?? "14");
  const [aboveSma, setAboveSma] = useState(persisted?.aboveSma ?? "");
  const [belowSma, setBelowSma] = useState(persisted?.belowSma ?? "");
  const [maType, setMaType] = useState<"sma" | "ema">(persisted?.maType ?? "sma");

  const [sortKey, setSortKey] = useState<SortKey>(persisted?.sortKey ?? "symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(persisted?.sortDir ?? "asc");

  const [cachedResults, setCachedResults] = useState<PersistedScreenerRow[] | null>(
    persisted?.results ?? null,
  );
  const [cachedScannedAt, setCachedScannedAt] = useState<string | null>(
    persisted?.scannedAt ?? null,
  );

  useEffect(() => {
    saveScreenerState({
      source,
      customSymbols,
      priceMin,
      priceMax,
      rsiMin,
      rsiMax,
      rsiPeriod,
      aboveSma,
      belowSma,
      maType,
      sortKey,
      sortDir,
      assetTypeFilter,
      exchangeFilter,
      ...(cachedResults != null ? { results: cachedResults } : {}),
      ...(cachedScannedAt != null ? { scannedAt: cachedScannedAt } : {}),
    });
  }, [
    source,
    customSymbols,
    priceMin,
    priceMax,
    rsiMin,
    rsiMax,
    rsiPeriod,
    aboveSma,
    belowSma,
    maType,
    sortKey,
    sortDir,
    assetTypeFilter,
    exchangeFilter,
    cachedResults,
    cachedScannedAt,
  ]);

  const sourcesQuery = trpc.screener.getSymbolSources.useQuery(undefined, {
    staleTime: 60_000,
  });

  const scanMutation = trpc.screener.scan.useMutation({
    onSuccess: (data) => {
      setCachedResults(data.results);
      setCachedScannedAt(data.scannedAt ?? new Date().toISOString());
    },
    onError: (err) => toast.error(err.message ?? t("screener.scanFailed")),
  });

  const sourceSymbols = useMemo(() => {
    if (source === "custom") {
      return customSymbols
        .split(/[,;\s]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
    }
    if (!sourcesQuery.data) return [];
    return source === "portfolio"
      ? sourcesQuery.data.portfolio
      : sourcesQuery.data.watchlist;
  }, [source, customSymbols, sourcesQuery.data]);

  function runScan(e: React.FormEvent) {
    e.preventDefault();
    if (sourceSymbols.length === 0) return;
    scanMutation.mutate({
      symbols: sourceSymbols.slice(0, 100),
      filters: {
        priceMin: priceMin ? Number(priceMin) : null,
        priceMax: priceMax ? Number(priceMax) : null,
        rsiMin: rsiMin ? Number(rsiMin) : null,
        rsiMax: rsiMax ? Number(rsiMax) : null,
        rsiPeriod: Number(rsiPeriod) || 14,
        aboveSma: aboveSma ? Number(aboveSma) : null,
        belowSma: belowSma ? Number(belowSma) : null,
        maType,
        dividendYieldMin: null,
      },
    });
  }

  const results = cachedResults ?? [];

  const sortedResults = useMemo(() => {
    const copy = [...results];
    const mult = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string")
        return av.localeCompare(bv) * mult;
      return ((av as number) - (bv as number)) * mult;
    });
    return copy;
  }, [results, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "symbol" ? "asc" : "desc");
    }
  }

  function clearFilters() {
    setPriceMin("");
    setPriceMax("");
    setRsiMin("");
    setRsiMax("");
    setRsiPeriod("14");
    setAboveSma("");
    setBelowSma("");
    setMaType("sma");
  }

  const hasFilters =
    priceMin || priceMax || rsiMin || rsiMax || aboveSma || belowSma;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold">{t("screener.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            {t("screener.filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={runScan} className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.source")}
                </Label>
                <select
                  value={source}
                  onChange={(e) =>
                    setSource(
                      e.target.value as "portfolio" | "watchlist" | "custom",
                    )
                  }
                  className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
                >
                  <option value="portfolio">
                    {t("screener.sourcePortfolio")} (
                    {sourcesQuery.data?.portfolio.length ?? 0})
                  </option>
                  <option value="watchlist">
                    {t("screener.sourceWatchlist")} (
                    {sourcesQuery.data?.watchlist.length ?? 0})
                  </option>
                  <option value="custom">{t("screener.sourceCustom")}</option>
                </select>
              </div>

              {source === "custom" && (
                <SymbolPicker
                  inputId="screener-custom-symbols"
                  listId="screener-symbol-suggestions"
                  value={customSymbols}
                  onChange={setCustomSymbols}
                  placeholder="AAPL, MSFT, GOOGL"
                  inputClassName="h-8 w-64"
                  searchTerm={customSymbols.split(/[,;\s]+/).pop() ?? ""}
                  assetTypeFilter={assetTypeFilter}
                  onAssetTypeChange={setAssetTypeFilter}
                  exchangeFilter={exchangeFilter}
                  onExchangeChange={setExchangeFilter}
                />
              )}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.priceMin")}
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-8 w-24"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.priceMax")}
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-8 w-24"
                  placeholder="∞"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.rsiMin")}
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={rsiMin}
                  onChange={(e) => setRsiMin(e.target.value)}
                  className="h-8 w-20"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.rsiMax")}
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={rsiMax}
                  onChange={(e) => setRsiMax(e.target.value)}
                  className="h-8 w-20"
                  placeholder="100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.rsiPeriod")}
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="2"
                  max="100"
                  value={rsiPeriod}
                  onChange={(e) => setRsiPeriod(e.target.value)}
                  className="h-8 w-16"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.aboveMa")}
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="2"
                  max="500"
                  value={aboveSma}
                  onChange={(e) => setAboveSma(e.target.value)}
                  className="h-8 w-20"
                  placeholder="—"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.belowMa")}
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="2"
                  max="500"
                  value={belowSma}
                  onChange={(e) => setBelowSma(e.target.value)}
                  className="h-8 w-20"
                  placeholder="—"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                  {t("screener.maType")}
                </Label>
                <select
                  value={maType}
                  onChange={(e) => setMaType(e.target.value as "sma" | "ema")}
                  className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
                >
                  <option value="sma">SMA</option>
                  <option value="ema">EMA</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={scanMutation.isPending || sourceSymbols.length === 0}
              >
                {scanMutation.isPending ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="mr-1 h-3.5 w-3.5" />
                )}
                {scanMutation.isPending
                  ? t("screener.scanning")
                  : t("screener.scan")}
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={clearFilters}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  {t("screener.clearFilters")}
                </Button>
              )}
              <span className="text-xs text-[var(--color-muted-fg)]">
                {t("screener.symbolCount", { count: sourceSymbols.length })}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {scanMutation.isPending && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("screener.scanning")}
        </div>
      )}

      {cachedResults && !scanMutation.isPending && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {t("screener.results")} ({results.length})
            </CardTitle>
            {cachedScannedAt && (
              <span className="text-xs text-[var(--color-muted-fg)]">
                {new Date(cachedScannedAt).toLocaleString()}
              </span>
            )}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {results.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--color-muted-fg)]">
                {t("screener.noResults")}
              </p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
                    <SortTh
                      active={sortKey === "symbol"}
                      dir={sortDir}
                      onClick={() => toggleSort("symbol")}
                    >
                      {t("screener.colSymbol")}
                    </SortTh>
                    <SortTh
                      active={sortKey === "lastClose"}
                      dir={sortDir}
                      onClick={() => toggleSort("lastClose")}
                      align="right"
                    >
                      {t("screener.colPrice")}
                    </SortTh>
                    <SortTh
                      active={sortKey === "change1d"}
                      dir={sortDir}
                      onClick={() => toggleSort("change1d")}
                      align="right"
                    >
                      {t("screener.colChange")}
                    </SortTh>
                    <SortTh
                      active={sortKey === "rsi"}
                      dir={sortDir}
                      onClick={() => toggleSort("rsi")}
                      align="right"
                    >
                      RSI
                    </SortTh>
                    <SortTh
                      active={sortKey === "sma50"}
                      dir={sortDir}
                      onClick={() => toggleSort("sma50")}
                      align="right"
                    >
                      SMA 50
                    </SortTh>
                    <SortTh
                      active={sortKey === "sma200"}
                      dir={sortDir}
                      onClick={() => toggleSort("sma200")}
                      align="right"
                    >
                      SMA 200
                    </SortTh>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r) => (
                    <tr
                      key={r.symbol}
                      className="border-b border-[var(--color-border)]"
                    >
                      <td className="px-2 py-2">
                        <Link
                          to="/dashboard/analysis"
                          search={{ symbol: r.symbol }}
                          className="font-medium text-[var(--color-fg)] hover:underline"
                        >
                          {r.symbol}
                        </Link>
                        {r.name && (
                          <span className="ml-1.5 text-xs text-[var(--color-muted-fg)]">
                            {r.name}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNum(r.lastClose)}
                      </td>
                      <td
                        className={
                          "px-2 py-2 text-right tabular-nums " +
                          (r.change1d == null
                            ? ""
                            : r.change1d >= 0
                              ? "text-[#10b981]"
                              : "text-[#ef4444]")
                        }
                      >
                        {formatPct(r.change1d)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        <RsiBadge value={r.rsi} />
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNum(r.sma50)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        {formatNum(r.sma200)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

function RsiBadge({ value }: { value: number | null }) {
  if (value == null) return <span>—</span>;
  const color =
    value >= 70
      ? "text-[#ef4444]"
      : value <= 30
        ? "text-[#10b981]"
        : "";
  return <span className={color}>{value.toFixed(1)}</span>;
}

function SortTh({
  children,
  onClick,
  active,
  dir,
  align = "left",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-2 py-2 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={onClick}
        className={
          "flex items-center gap-1 text-xs font-medium uppercase " +
          (active
            ? "text-[var(--color-fg)]"
            : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]") +
          (align === "right" ? " ml-auto" : "")
        }
      >
        {children}
        {active && (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </button>
    </th>
  );
}
