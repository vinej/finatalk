import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { ChatDrawer } from "@/components/ai/chat-drawer";
import { MarketChart } from "@/components/market-chart";
import { IndicatorLibrary } from "@/components/analysis/indicator-library";
import { IndicatorList } from "@/components/analysis/indicator-list";
import { EtfSection } from "@/components/analysis/etf-section";
import { AnalystSection } from "@/components/analysis/analyst-section";
import { OwnershipSection } from "@/components/analysis/ownership-section";
import { ShortInterestSection } from "@/components/analysis/short-interest-section";
import { OpenAnalysisAction, type AnalysisLoadData } from "@/components/analysis/open-analysis-action";
import { SaveAnalysisAction } from "@/components/analysis/save-analysis-action";
import { ConfidenceBadge } from "@/components/confidence-badge";
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
import { loadAnalysisState, saveAnalysisState } from "@/lib/analysis-persistence";
import { COMMODITIES, COMMODITY_EXCHANGE_BY_CATEGORY } from "@/lib/commodities";
import { trpc } from "@/lib/trpc";
import type { RouterOutputs } from "@finatalk/trpc";

type AnalysisSearch = {
  analysisId?: string;
  symbol?: string;
};

export const Route = createFileRoute("/_auth/dashboard_/analysis")({
  component: AnalysisPage,
  validateSearch: (raw: Record<string, unknown>): AnalysisSearch => ({
    analysisId: typeof raw.analysisId === "string" ? raw.analysisId : undefined,
    symbol: typeof raw.symbol === "string" ? raw.symbol : undefined,
  }),
});

type AnalyzeResult = RouterOutputs["market"]["analyze"]["results"][number];

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
const INTERVALS = ["1d", "1wk", "1mo"] as const;

function AnalysisPage() {
  const { t, i18n } = useTranslation();
  const search = Route.useSearch();
  const persisted = useMemo(() => loadAnalysisState(), []);
  const [symbolInput, setSymbolInput] = useState(persisted?.symbolInput ?? "AAPL");
  const [submittedSymbol, setSubmittedSymbol] = useState(persisted?.submittedSymbol ?? "AAPL");
  const [range, setRange] = useState<(typeof RANGES)[number]>(persisted?.range ?? "6mo");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>(persisted?.interval ?? "1d");
  const [convertToCad, setConvertToCad] = useState(persisted?.convertToCad ?? false);
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>(persisted?.activeIndicators ?? DEFAULT_SEED);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set(persisted?.hiddenIds ?? []));
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(persisted?.loadedAnalysisId ?? null);
  const [loadedAnalysisTitle, setLoadedAnalysisTitle] = useState<string | null>(persisted?.loadedAnalysisTitle ?? null);
  const [loadedAnalysisDescription, setLoadedAnalysisDescription] = useState<string | null>(persisted?.loadedAnalysisDescription ?? null);
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(persisted?.controlsCollapsed ?? false);
  const [indicatorsCollapsed, setIndicatorsCollapsed] = useState<boolean>(persisted?.indicatorsCollapsed ?? false);
  const [latestCollapsed, setLatestCollapsed] = useState<boolean>(persisted?.latestCollapsed ?? false);
  const [etfCollapsed, setEtfCollapsed] = useState<boolean>(persisted?.etfCollapsed ?? false);
  const [analystCollapsed, setAnalystCollapsed] = useState<boolean>(persisted?.analystCollapsed ?? false);
  const [ownershipCollapsed, setOwnershipCollapsed] = useState<boolean>(persisted?.ownershipCollapsed ?? false);
  const [shortInterestCollapsed, setShortInterestCollapsed] = useState<boolean>(persisted?.shortInterestCollapsed ?? false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "stock" | "etf" | "commodity">(persisted?.assetTypeFilter ?? "all");
  const [exchangeFilter, setExchangeFilter] = useState<string>(persisted?.exchangeFilter ?? "all");
  const [confidence, setConfidence] = useState<"high" | "medium" | "low" | null>(null);

  const confidenceMutation = trpc.research.getConfidence.useMutation({
    onSuccess: (data) => setConfidence(data.confidence),
    onError: (e) => toast.error(e.message),
  });

  function refreshConfidence() {
    if (!submittedSymbol) return;
    confidenceMutation.mutate({ symbol: submittedSymbol, language: i18n.language });
  }

  useEffect(() => {
    saveAnalysisState({
      symbolInput,
      submittedSymbol,
      range,
      interval,
      convertToCad,
      activeIndicators,
      hiddenIds: [...hiddenIds],
      loadedAnalysisId,
      loadedAnalysisTitle,
      loadedAnalysisDescription,
      controlsCollapsed,
      indicatorsCollapsed,
      latestCollapsed,
      etfCollapsed,
      analystCollapsed,
      ownershipCollapsed,
      shortInterestCollapsed,
      assetTypeFilter,
      exchangeFilter,
    });
  }, [
    symbolInput,
    submittedSymbol,
    range,
    interval,
    convertToCad,
    activeIndicators,
    hiddenIds,
    loadedAnalysisId,
    loadedAnalysisTitle,
    loadedAnalysisDescription,
    controlsCollapsed,
    indicatorsCollapsed,
    latestCollapsed,
    etfCollapsed,
    analystCollapsed,
    ownershipCollapsed,
    shortInterestCollapsed,
    assetTypeFilter,
    exchangeFilter,
  ]);

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
    { retry: false, staleTime: 60_000, enabled: submittedSymbol.length > 0 },
  );

  const utils = trpc.useUtils();
  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const updateAnalysisMutation = trpc.analysis.updateAnalysis.useMutation({
    onSuccess: () => utils.analysis.listAnalyses.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const summarizeMutation = trpc.ai.summarizeChart.useMutation({
    onSuccess: (data) => {
      setLoadedAnalysisDescription(data.summary);
      if (loadedAnalysisId) {
        updateAnalysisMutation.mutate({ id: loadedAnalysisId, description: data.summary });
      }
    },
    onError: (err) => toast.error(err.message ?? t("analysis.summarizeFailed")),
  });

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setChatOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const appliedSymbolRef = useRef<string | null>(null);
  useEffect(() => {
    if (search.analysisId) return;
    const sym = search.symbol?.toUpperCase();
    if (!sym || appliedSymbolRef.current === sym) return;
    appliedSymbolRef.current = sym;
    setSymbolInput(sym);
    setSubmittedSymbol(sym);
    setLoadedAnalysisId(null);
    setLoadedAnalysisTitle(null);
    setLoadedAnalysisDescription(null);
  }, [search.analysisId, search.symbol]);

  const appliedSearchRef = useRef<string | null>(null);
  useEffect(() => {
    if (!search.analysisId) return;
    const key = `${search.analysisId}:${search.symbol ?? ""}`;
    if (appliedSearchRef.current === key) return;
    appliedSearchRef.current = key;
    (async () => {
      try {
        const data = await utils.client.analysis.getAnalysis.query({ id: search.analysisId! });
        const sym = (data.symbol || search.symbol || "").toUpperCase();
        if (sym) {
          setSymbolInput(sym);
          setSubmittedSymbol(sym);
        }
        setActiveIndicators(data.indicators);
        setHiddenIds(new Set());
        setLoadedAnalysisId(data.id);
        setLoadedAnalysisTitle(data.title);
        setLoadedAnalysisDescription(data.description);
        if (data.range) setRange(data.range as (typeof RANGES)[number]);
        if (data.interval) setInterval(data.interval as (typeof INTERVALS)[number]);
        setConvertToCad(data.convertTo === "CAD");
      } catch (err) {
        toast.error((err as Error).message ?? t("analysis.loadFailed"));
      }
    })();
  }, [search.analysisId, search.symbol, utils, t]);

  function onSummarize() {
    const visibleIndicators = activeIndicators
      .filter((a) => !hiddenIds.has(a.localId))
      .map((a) => a.spec);
    summarizeMutation.mutate({
      symbol: submittedSymbol,
      range,
      interval,
      indicators: visibleIndicators,
      convertTo: convertToCad ? "CAD" : null,
      language: i18n.language,
    });
  }

  const [refreshingSymbols, setRefreshingSymbols] = useState(false);
  async function refreshSymbols() {
    setRefreshingSymbols(true);
    try {
      const fresh = await utils.client.market.symbols.query({ force: true });
      utils.market.symbols.setData(undefined, fresh);
      toast.success(t("analysis.symbolsRefreshed", { count: fresh.symbols.length }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("analysis.symbolsRefreshFailed"));
    } finally {
      setRefreshingSymbols(false);
    }
  }

  const commodityEntries = useMemo(
    () =>
      COMMODITIES.map((c) => ({
        symbol: c.symbol,
        name: t(c.nameKey),
        exchange: COMMODITY_EXCHANGE_BY_CATEGORY[c.category],
        assetType: "commodity" as const,
      })),
    [t],
  );

  const mergedSymbols = useMemo(() => {
    const raw = symbolsQuery.data?.symbols ?? [];
    return [...raw, ...commodityEntries];
  }, [symbolsQuery.data, commodityEntries]);

  const submittedSymbolMeta = useMemo(() => {
    const match = mergedSymbols.find((s) => s.symbol === submittedSymbol);
    return match ?? null;
  }, [mergedSymbols, submittedSymbol]);

  const availableExchanges = useMemo(() => {
    const set = new Set<string>();
    for (const s of mergedSymbols) if (s.exchange) set.add(s.exchange);
    return [...set].sort();
  }, [mergedSymbols]);

  const suggestions = useMemo(() => {
    const byType =
      assetTypeFilter === "all"
        ? mergedSymbols
        : mergedSymbols.filter((s) => s.assetType === assetTypeFilter);
    const all = exchangeFilter === "all" ? byType : byType.filter((s) => s.exchange === exchangeFilter);
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
  }, [mergedSymbols, symbolInput, assetTypeFilter, exchangeFilter]);

  useEffect(() => {
    if (query.error) toast.error(query.error.message ?? t("analysis.fetchFailed"));
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

  function loadAnalysis(data: AnalysisLoadData) {
    setSymbolInput(data.symbol);
    setSubmittedSymbol(data.symbol);
    setActiveIndicators(data.items);
    setHiddenIds(new Set());
    setLoadedAnalysisId(data.id);
    setLoadedAnalysisTitle(data.title);
    setLoadedAnalysisDescription(data.description);
    setRange(data.range as (typeof RANGES)[number]);
    setInterval(data.interval as (typeof INTERVALS)[number]);
    setConvertToCad(data.convertTo === "CAD");
    setConfidence(null);
  }

  function newAnalysis() {
    setSymbolInput("");
    setSubmittedSymbol("");
    setActiveIndicators([]);
    setHiddenIds(new Set());
    setLoadedAnalysisId(null);
    setLoadedAnalysisTitle(null);
    setLoadedAnalysisDescription(null);
    setRange("6mo");
    setInterval("1d");
    setConvertToCad(false);
    setAssetTypeFilter("all");
    setConfidence(null);
  }

  function onSymbolChange(next: string) {
    setSymbolInput(next);
    if (loadedAnalysisId) {
      setLoadedAnalysisId(null);
      setLoadedAnalysisTitle(null);
      setLoadedAnalysisDescription(null);
    }
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
          <button
            type="button"
            onClick={() => setControlsCollapsed((c) => !c)}
            className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[var(--color-accent)]"
            aria-expanded={!controlsCollapsed}
            title={controlsCollapsed ? t("analysis.expand") : t("analysis.collapse")}
          >
            {controlsCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
            )}
            <CardTitle>
              {t("analysis.title")}
              {loadedAnalysisTitle && (
                <span className="ml-2 text-sm font-normal text-[var(--color-muted-fg)]">— {loadedAnalysisTitle}</span>
              )}
              {confidence && (
                <ConfidenceBadge level={confidence} className="ml-2 align-middle" />
              )}
            </CardTitle>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshConfidence}
              disabled={confidenceMutation.isPending || !submittedSymbol}
              title={t("analysis.refreshConfidence")}
              className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)] disabled:opacity-50"
            >
              <RefreshCw className={"h-4 w-4" + (confidenceMutation.isPending ? " animate-spin" : "")} aria-hidden />
            </button>
            <Button type="button" size="sm" variant="outline" onClick={newAnalysis}>
              {t("analysis.newAnalysis")}
            </Button>
            <SaveAnalysisAction
              symbol={submittedSymbol}
              range={range}
              interval={interval}
              convertTo={convertToCad ? "CAD" : null}
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
              onTitleChange={(id, title) => {
                if (id === loadedAnalysisId) setLoadedAnalysisTitle(title);
              }}
            />
          </div>
        </CardHeader>
        {!controlsCollapsed && (
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="assetType">{t("analysis.assetType")}</Label>
              <select
                id="assetType"
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value as "all" | "stock" | "etf" | "commodity")}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                <option value="all">{t("analysis.assetAll")}</option>
                <option value="stock">{t("analysis.assetStock")}</option>
                <option value="etf">{t("analysis.assetEtf")}</option>
                <option value="commodity">{t("analysis.assetCommodity")}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="exchange">{t("analysis.exchange")}</Label>
              <select
                id="exchange"
                value={exchangeFilter}
                onChange={(e) => setExchangeFilter(e.target.value)}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                <option value="all">{t("analysis.exchangeAll")}</option>
                {availableExchanges.map((ex) => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="symbol">{t("analysis.symbol")}</Label>
              <Input
                id="symbol"
                list="symbol-suggestions"
                autoComplete="off"
                value={symbolInput}
                onChange={(e) => onSymbolChange(e.target.value)}
                className="w-48"
                placeholder={symbolsQuery.isPending ? t("analysis.loadingSymbols") : "AAPL"}
              />
              <datalist id="symbol-suggestions">
                {suggestions.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.exchange}){s.assetType === "etf" ? " · ETF" : s.assetType === "commodity" ? " · Futures" : ""}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="range">{t("analysis.range")}</Label>
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
              <Label htmlFor="interval">{t("analysis.interval")}</Label>
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
              {t("analysis.showInCad")}
            </label>
            <Button type="submit">{t("analysis.loadData")}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={refreshSymbols}
              disabled={refreshingSymbols}
              title={symbolsQuery.data ? t("analysis.symbolsFetchedAt", { date: new Date(symbolsQuery.data.fetchedAt).toLocaleString() }) : ""}
            >
              {refreshingSymbols ? "…" : t("analysis.refreshSymbols")}
            </Button>
          </form>
          {query.data && (
            <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
              {query.data.nativeCurrency === query.data.displayCurrency
                ? t("analysis.currency", { code: query.data.displayCurrency })
                : t("analysis.currencyConverted", {
                    from: query.data.nativeCurrency,
                    to: query.data.displayCurrency,
                  })}
            </p>
          )}
          {symbolsQuery.data && (
            <p className="mt-2 text-xs text-[var(--color-muted-fg)]">
              {t("analysis.symbolsCount", { count: symbolsQuery.data.symbols.length })}
            </p>
          )}
        </CardContent>
        )}
      </Card>

      {submittedSymbol && (
        <EtfSection
          symbol={submittedSymbol}
          collapsed={etfCollapsed}
          onToggleCollapsed={() => setEtfCollapsed((c) => !c)}
        />
      )}

      {submittedSymbol && (
        <AnalystSection
          symbol={submittedSymbol}
          collapsed={analystCollapsed}
          onToggleCollapsed={() => setAnalystCollapsed((c) => !c)}
        />
      )}

      {submittedSymbol && (
        <OwnershipSection
          symbol={submittedSymbol}
          collapsed={ownershipCollapsed}
          onToggleCollapsed={() => setOwnershipCollapsed((c) => !c)}
        />
      )}

      {submittedSymbol && (
        <ShortInterestSection
          symbol={submittedSymbol}
          collapsed={shortInterestCollapsed}
          onToggleCollapsed={() => setShortInterestCollapsed((c) => !c)}
        />
      )}

      <div className={!indicatorsCollapsed && (loadedAnalysisDescription || loadedAnalysisTitle) ? "grid gap-4 md:grid-cols-2" : ""}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <button
              type="button"
              onClick={() => setIndicatorsCollapsed((c) => !c)}
              className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[var(--color-accent)]"
              aria-expanded={!indicatorsCollapsed}
              title={indicatorsCollapsed ? t("analysis.expand") : t("analysis.collapse")}
            >
              {indicatorsCollapsed ? (
                <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              )}
              <CardTitle className="text-base">{t("analysis.indicators")}</CardTitle>
            </button>
          </CardHeader>
          {!indicatorsCollapsed && (
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
          )}
        </Card>

        {!indicatorsCollapsed && (loadedAnalysisDescription || loadedAnalysisTitle) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {loadedAnalysisTitle ?? t("analysis.analyses")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {loadedAnalysisDescription ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-fg)]">
                  {loadedAnalysisDescription}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-muted-fg)]">
                  {t("analysis.analysisDescription")}
                </p>
              )}
              <AiDisclaimer />
            </CardContent>
          </Card>
        )}
      </div>

      {query.data && query.data.results.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <button
              type="button"
              onClick={() => setLatestCollapsed((c) => !c)}
              className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[var(--color-accent)]"
              aria-expanded={!latestCollapsed}
              title={latestCollapsed ? t("analysis.expand") : t("analysis.collapse")}
            >
              {latestCollapsed ? (
                <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              )}
              <CardTitle className="text-base">{t("analysis.latest")}</CardTitle>
            </button>
          </CardHeader>
          {!latestCollapsed && (
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-4">
                {query.data.results.map((r, i) => (
                  <LatestCell key={i} result={r} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base">
            <span className="font-mono">{submittedSymbol}</span>
            {submittedSymbolMeta?.name && (
              <span className="ml-2 font-normal text-[var(--color-muted-fg)]">
                {submittedSymbolMeta.name}
                {submittedSymbolMeta.exchange && ` (${submittedSymbolMeta.exchange})`}
              </span>
            )}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChatOpen(true)}
              title={t("analysis.chatShortcutHint")}
            >
              {t("analysis.chatOpen")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSummarize}
              disabled={summarizeMutation.isPending || !query.data}
            >
              {summarizeMutation.isPending ? t("analysis.summarizing") : t("analysis.summarize")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {query.isPending ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-[var(--color-muted-fg)]">
              {t("analysis.loading")}
            </div>
          ) : query.isError || !query.data ? (
            <div className="flex h-[560px] items-center justify-center text-sm text-[var(--color-destructive)]">
              {query.error?.message ?? t("analysis.fetchFailed")}
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

      <ChatDrawer
        open={chatOpen}
        onOpenChange={setChatOpen}
        context={{
          symbol: submittedSymbol,
          range,
          interval,
          convertTo: convertToCad ? "CAD" : null,
          activeIndicators,
          hiddenIds,
        }}
      />
    </div>
  );
}

function LatestCell({ result }: { result: AnalyzeResult }) {
  const last = latestEntry(result);
  const label = cellLabel(result);

  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="text-xs text-[var(--color-muted-fg)]">{label}</div>
      <div className="mt-1 font-mono">{last ? formatLast(result.kind, last) : "—"}</div>
    </div>
  );
}

function latestEntry(result: AnalyzeResult): Record<string, unknown> | undefined {
  if (result.kind === "maCross") {
    const fast = result.series.fast.at(-1);
    const slow = result.series.slow.at(-1);
    const lastEvent = result.series.events.at(-1);
    return fast && slow
      ? { fast: fast.value, slow: slow.value, event: lastEvent?.direction ?? null }
      : undefined;
  }
  if (result.kind === "macdCross") {
    const last = result.series.macd.at(-1);
    const lastEvent = result.series.events.at(-1);
    return last
      ? { macd: last.macd, signal: last.signal, event: lastEvent?.direction ?? null }
      : undefined;
  }
  return result.series[result.series.length - 1];
}

function cellLabel(result: AnalyzeResult): string {
  switch (result.kind) {
    case "macd":
      return `MACD ${result.spec.fast}/${result.spec.slow}/${result.spec.signal}`;
    case "bbands":
      return `BB ${result.spec.period}/${result.spec.stdDev}`;
    case "stoch":
      return `STOCH ${result.spec.period}/${result.spec.signal}/${result.spec.smooth}`;
    case "obv":
      return "OBV";
    case "psar":
      return `PSAR ${result.spec.step}/${result.spec.max}`;
    case "maCross":
      return `${result.spec.maType.toUpperCase()} CROSS ${result.spec.fastPeriod}/${result.spec.slowPeriod}`;
    case "macdCross":
      return `MACD CROSS ${result.spec.fast}/${result.spec.slow}/${result.spec.signal}`;
    default:
      return `${result.kind.toUpperCase()} ${result.spec.period}`;
  }
}

function formatLast(kind: string, last: Record<string, number | unknown>): string {
  const fmt = (n: unknown) => (typeof n === "number" ? n.toFixed(2) : "—");
  if (kind === "macd") return `${fmt(last.macd)} / ${fmt(last.signal)} / ${fmt(last.histogram)}`;
  if (kind === "bbands") return `${fmt(last.upper)} / ${fmt(last.middle)} / ${fmt(last.lower)}`;
  if (kind === "stoch") return `${fmt(last.k)} / ${fmt(last.d)}`;
  if (kind === "adx") return `${fmt(last.adx)} / +DI ${fmt(last.pdi)} / −DI ${fmt(last.mdi)}`;
  if (kind === "maCross") {
    const ev = last.event === "bull" ? " ↑" : last.event === "bear" ? " ↓" : "";
    return `${fmt(last.fast)} / ${fmt(last.slow)}${ev}`;
  }
  if (kind === "macdCross") {
    const ev = last.event === "bull" ? " ↑" : last.event === "bear" ? " ↓" : "";
    return `${fmt(last.macd)} / ${fmt(last.signal)}${ev}`;
  }
  return fmt(last.value);
}
