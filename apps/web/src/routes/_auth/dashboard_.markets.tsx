import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MarketChart } from "@/components/market-chart";
import { IndicatorLibrary } from "@/components/markets/indicator-library";
import { IndicatorList } from "@/components/markets/indicator-list";
import { OpenAnalysisAction } from "@/components/markets/open-analysis-action";
import { OpenSavedChartsAction } from "@/components/markets/open-saved-charts-action";
import { SaveAnalysisAction } from "@/components/markets/save-analysis-action";
import { SaveChartAction } from "@/components/markets/save-chart-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SEED,
  type ActiveIndicator,
  type IndicatorColor,
  type IndicatorSpec,
} from "@/lib/indicator-defaults";
import { trpc } from "@/lib/trpc";
import type { RouterOutputs } from "@finatalk/trpc";

export const Route = createFileRoute("/_auth/dashboard_/markets")({
  component: MarketsPage,
});

type AnalyzeResult = RouterOutputs["market"]["analyze"]["results"][number];

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
const INTERVALS = ["1d", "1wk", "1mo"] as const;

function MarketsPage() {
  const { t } = useTranslation();
  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [submittedSymbol, setSubmittedSymbol] = useState("AAPL");
  const [range, setRange] = useState<(typeof RANGES)[number]>("6mo");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("1d");
  const [convertToCad, setConvertToCad] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>(DEFAULT_SEED);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(null);
  const [loadedAnalysisTitle, setLoadedAnalysisTitle] = useState<string | null>(null);
  const [loadedAnalysisDescription, setLoadedAnalysisDescription] = useState<string | null>(null);
  const [loadedChartTitle, setLoadedChartTitle] = useState<string | null>(null);

  const indicators = useMemo(() => activeIndicators.map((a) => a.spec), [activeIndicators]);
  const colors = useMemo(() => activeIndicators.map((a) => a.color), [activeIndicators]);
  const visibleColors = useMemo(
    () => activeIndicators.filter((a) => !hiddenIds.has(a.localId)).map((a) => a.color),
    [activeIndicators, hiddenIds],
  );

  function toggleHidden(localId: string) {
    setHiddenIds((curr) => {
      const next = new Set(curr);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  }

  const query = trpc.market.analyze.useQuery(
    { symbol: submittedSymbol, range, interval, indicators, convertTo: convertToCad ? "CAD" : null },
    { retry: false, staleTime: 60_000 },
  );

  const utils = trpc.useUtils();
  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const [refreshingSymbols, setRefreshingSymbols] = useState(false);
  async function refreshSymbols() {
    setRefreshingSymbols(true);
    try {
      const fresh = await utils.client.market.symbols.query({ force: true });
      utils.market.symbols.setData(undefined, fresh);
      toast.success(t("markets.symbolsRefreshed", { count: fresh.symbols.length }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("markets.symbolsRefreshFailed"));
    } finally {
      setRefreshingSymbols(false);
    }
  }

  const suggestions = useMemo(() => {
    const all = symbolsQuery.data?.symbols ?? [];
    const q = symbolInput.trim().toUpperCase();
    if (!q) return all.slice(0, 200);
    const starts: typeof all = [];
    const contains: typeof all = [];
    for (const s of all) {
      if (s.symbol.startsWith(q)) starts.push(s);
      else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q)) contains.push(s);
      if (starts.length >= 200) break;
    }
    return [...starts, ...contains].slice(0, 200);
  }, [symbolsQuery.data, symbolInput]);

  useEffect(() => {
    if (query.error) toast.error(query.error.message ?? t("markets.fetchFailed"));
  }, [query.error, t]);

  function addIndicator(item: ActiveIndicator) {
    setActiveIndicators((curr) => [...curr, item]);
  }
  function removeIndicator(localId: string) {
    setActiveIndicators((curr) => curr.filter((x) => x.localId !== localId));
    setHiddenIds((curr) => {
      if (!curr.has(localId)) return curr;
      const next = new Set(curr);
      next.delete(localId);
      return next;
    });
  }
  function updateIndicator(localId: string, next: { spec: IndicatorSpec; color: IndicatorColor }) {
    setActiveIndicators((curr) =>
      curr.map((x) => (x.localId === localId ? { ...x, spec: next.spec, color: next.color } : x)),
    );
  }

  function loadAnalysis(items: ActiveIndicator[], id: string, title: string, description: string) {
    setActiveIndicators(items);
    setHiddenIds(new Set());
    setLoadedAnalysisId(id);
    setLoadedAnalysisTitle(title);
    setLoadedAnalysisDescription(description);
  }

  function loadSavedChart(chart: {
    title: string;
    symbol: string;
    range: (typeof RANGES)[number];
    interval: (typeof INTERVALS)[number];
    convertTo: "CAD" | null;
    indicators: ActiveIndicator[];
  }) {
    setSymbolInput(chart.symbol);
    setSubmittedSymbol(chart.symbol);
    setRange(chart.range);
    setInterval(chart.interval);
    setConvertToCad(chart.convertTo === "CAD");
    setActiveIndicators(chart.indicators);
    setHiddenIds(new Set());
    setLoadedAnalysisId(null);
    setLoadedAnalysisTitle(null);
    setLoadedAnalysisDescription(null);
    setLoadedChartTitle(chart.title);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = symbolInput.trim().toUpperCase();
    if (trimmed) setSubmittedSymbol(trimmed);
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>{t("markets.title")}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <SaveChartAction
              current={{
                symbol: submittedSymbol,
                range,
                interval,
                convertTo: convertToCad ? "CAD" : null,
                indicators: activeIndicators,
              }}
              defaultTitle={loadedChartTitle}
            />
            <OpenSavedChartsAction onLoad={loadSavedChart} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="symbol">{t("markets.symbol")}</Label>
              <Input
                id="symbol"
                list="symbol-suggestions"
                autoComplete="off"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                className="w-48"
                placeholder={symbolsQuery.isPending ? t("markets.loadingSymbols") : "AAPL"}
              />
              <datalist id="symbol-suggestions">
                {suggestions.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.exchange})
                  </option>
                ))}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="range">{t("markets.range")}</Label>
              <select
                id="range"
                value={range}
                onChange={(e) => setRange(e.target.value as (typeof RANGES)[number])}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="interval">{t("markets.interval")}</Label>
              <select
                id="interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value as (typeof INTERVALS)[number])}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                {INTERVALS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] px-3 text-sm">
              <input
                type="checkbox"
                checked={convertToCad}
                onChange={(e) => setConvertToCad(e.target.checked)}
                className="h-4 w-4"
              />
              {t("markets.showInCad")}
            </label>
            <Button type="submit">{t("markets.loadData")}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={refreshSymbols}
              disabled={refreshingSymbols}
              title={symbolsQuery.data ? t("markets.symbolsFetchedAt", { date: new Date(symbolsQuery.data.fetchedAt).toLocaleString() }) : ""}
            >
              {refreshingSymbols ? "…" : t("markets.refreshSymbols")}
            </Button>
          </form>
          {query.data && (
            <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
              {query.data.nativeCurrency === query.data.displayCurrency
                ? t("markets.currency", { code: query.data.displayCurrency })
                : t("markets.currencyConverted", {
                    from: query.data.nativeCurrency,
                    to: query.data.displayCurrency,
                  })}
            </p>
          )}
          {symbolsQuery.data && (
            <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
              {t("markets.symbolsCount", { count: symbolsQuery.data.symbols.length })}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base">{t("markets.indicators")}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <SaveAnalysisAction
              indicators={activeIndicators}
              defaultTitle={loadedAnalysisTitle}
              defaultDescription={loadedAnalysisDescription}
            />
            <OpenAnalysisAction
              indicators={activeIndicators}
              loadedAnalysisId={loadedAnalysisId}
              loadedAnalysisTitle={loadedAnalysisTitle}
              onLoad={loadAnalysis}
              onLoadedChange={(id) => {
                setLoadedAnalysisId(id);
                if (id === null) {
                  setLoadedAnalysisTitle(null);
                  setLoadedAnalysisDescription(null);
                }
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <IndicatorLibrary onAdd={addIndicator} />
          <IndicatorList
            items={activeIndicators}
            hiddenIds={hiddenIds}
            onToggleHidden={toggleHidden}
            onChange={updateIndicator}
            onRemove={removeIndicator}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {query.isPending ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-[var(--color-muted-fg)]">
              {t("markets.loading")}
            </div>
          ) : query.isError || !query.data ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-[var(--color-destructive)]">
              {query.error?.message ?? t("markets.fetchFailed")}
            </div>
          ) : (
            <MarketChart
              candles={query.data.candles}
              results={query.data.results.filter(
                (_, i) => activeIndicators[i] && !hiddenIds.has(activeIndicators[i].localId),
              )}
              colors={visibleColors}
            />
          )}
        </CardContent>
      </Card>

      {query.data && query.data.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("markets.latest")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-4">
              {query.data.results.map((r, i) => (
                <LatestCell key={i} result={r} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

function LatestCell({ result }: { result: AnalyzeResult }) {
  const last = result.series[result.series.length - 1];
  const label =
    result.kind === "macd"
      ? `MACD ${result.spec.fast}/${result.spec.slow}/${result.spec.signal}`
      : result.kind === "bbands"
        ? `BB ${result.spec.period}/${result.spec.stdDev}`
        : `${result.kind.toUpperCase()} ${result.spec.period}`;

  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="text-xs text-[var(--color-muted-fg)]">{label}</div>
      <div className="mt-1 font-mono">{last ? formatLast(result.kind, last) : "—"}</div>
    </div>
  );
}

function formatLast(kind: string, last: Record<string, number | unknown>): string {
  const fmt = (n: unknown) => (typeof n === "number" ? n.toFixed(2) : "—");
  if (kind === "macd") return `${fmt(last.macd)} / ${fmt(last.signal)} / ${fmt(last.histogram)}`;
  if (kind === "bbands") return `${fmt(last.upper)} / ${fmt(last.middle)} / ${fmt(last.lower)}`;
  return fmt(last.value);
}
