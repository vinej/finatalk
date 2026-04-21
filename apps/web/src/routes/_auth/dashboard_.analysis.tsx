import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai/disclaimer";
import { ChatDrawer } from "@/components/ai/chat-drawer";
import { Markdown } from "@/components/ai/markdown";
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
  createActive,
  DEFAULT_SEED,
  sortIndicators,
  type ActiveIndicator,
  type IndicatorColor,
  type IndicatorSpec,
} from "@/lib/indicator-defaults";
import { STRATEGY_GROUPS, STRATEGY_GUIDE, STRATEGY_KINDS, type StrategyKind } from "@/lib/strategy-guide";
import { STRATEGY_CHART_INDICATORS } from "@/lib/strategy-indicators";
import { evaluateStrategy, type StrategyAction } from "@/lib/strategy-signals";
import { pickLang, type Lang } from "@/lib/lang";
import { loadAnalysisState, saveAnalysisState } from "@/lib/analysis-persistence";
import { COMMODITIES, COMMODITY_EXCHANGE_BY_CATEGORY } from "@/lib/commodities";
import { CRYPTOS } from "@/lib/crypto";
import { INDICES } from "@/lib/indices";
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

const RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
const INTERVALS = ["1m", "5m", "15m", "30m", "60m", "90m", "1d", "1wk", "1mo"] as const;

type RangeValue = (typeof RANGES)[number];
type IntervalValue = (typeof INTERVALS)[number];

const INTRADAY_INTERVALS: readonly IntervalValue[] = ["1m", "5m", "15m", "30m", "60m", "90m"];

function isIntradayInterval(i: IntervalValue): boolean {
  return (INTRADAY_INTERVALS as readonly string[]).includes(i);
}

function compatibleRangesForInterval(i: IntervalValue): readonly RangeValue[] {
  if (i === "1m") return ["1d", "5d"];
  if (i === "5m" || i === "15m" || i === "30m" || i === "90m") return ["1d", "5d", "1mo"];
  if (i === "60m") return ["1d", "5d", "1mo", "3mo", "6mo", "1y"];
  return ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"];
}

function defaultRangeForInterval(i: IntervalValue): RangeValue {
  if (i === "1m") return "5d";
  if (isIntradayInterval(i)) return i === "60m" ? "1mo" : "5d";
  return "6mo";
}

function clampRangeForInterval(r: RangeValue, i: IntervalValue): RangeValue {
  const allowed = compatibleRangesForInterval(i);
  return allowed.includes(r) ? r : defaultRangeForInterval(i);
}
const SYMBOL_RE = /^[A-Z0-9.\-=^]+$/;
function sanitizeSymbol(s: string | null | undefined): string {
  if (!s) return "";
  const u = s.trim().toUpperCase();
  return SYMBOL_RE.test(u) ? u : "";
}

function AnalysisPage() {
  const { t, i18n } = useTranslation();
  const search = Route.useSearch();
  const persisted = useMemo(() => loadAnalysisState(), []);
  const [symbolInput, setSymbolInput] = useState(persisted?.symbolInput ?? "AAPL");
  const [submittedSymbol, setSubmittedSymbol] = useState(sanitizeSymbol(persisted?.submittedSymbol) || "AAPL");
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
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index">(persisted?.assetTypeFilter ?? "all");
  const [exchangeFilter, setExchangeFilter] = useState<string>(persisted?.exchangeFilter ?? "all");
  const [confidence, setConfidence] = useState<"high" | "medium" | "low" | null>(null);
  const [appliedStrategy, setAppliedStrategy] = useState<StrategyKind | null>(persisted?.appliedStrategy ?? null);

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
      appliedStrategy,
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
    appliedStrategy,
  ]);

  const sortedActiveIndicators = useMemo(() => sortIndicators(activeIndicators), [activeIndicators]);
  const indicators = useMemo(() => sortedActiveIndicators.map((a) => a.spec), [sortedActiveIndicators]);
  const colors = useMemo(() => sortedActiveIndicators.map((a) => a.color), [sortedActiveIndicators]);
  const visibleColors = useMemo(
    () => sortedActiveIndicators.filter((a) => !hiddenIds.has(a.localId)).map((a) => a.color),
    [sortedActiveIndicators, hiddenIds],
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

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const q = symbolInput.trim();
    if (q.length < 1) {
      setDebouncedSearch("");
      return;
    }
    const h = setTimeout(() => setDebouncedSearch(q), 250);
    return () => clearTimeout(h);
  }, [symbolInput]);

  const liveSearchQuery = trpc.market.searchSymbols.useQuery(
    {
      query: debouncedSearch,
      assetType: assetTypeFilter,
      limit: 20,
    },
    {
      enabled: debouncedSearch.length >= 1,
      staleTime: 60_000,
      retry: false,
    },
  );

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
    const sym = sanitizeSymbol(search.symbol);
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
        const rawSym = (data.symbol || search.symbol || "").toUpperCase();
        const sym = sanitizeSymbol(rawSym);
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
    const visibleIndicators = sortedActiveIndicators
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

  const cryptoEntries = useMemo(
    () =>
      CRYPTOS.map((c) => ({
        symbol: c.symbol,
        name: t(c.nameKey),
        exchange: "CCC",
        assetType: "crypto" as const,
      })),
    [t],
  );

  const indexEntries = useMemo(
    () =>
      INDICES.map((i) => ({
        symbol: i.yahooSymbol,
        name: t(i.labelKey),
        exchange: "Index",
        assetType: "index" as const,
      })),
    [t],
  );

  const mergedSymbols = useMemo(() => {
    const raw = symbolsQuery.data?.symbols ?? [];
    return [...raw, ...commodityEntries, ...cryptoEntries, ...indexEntries];
  }, [symbolsQuery.data, commodityEntries, cryptoEntries, indexEntries]);

  const submittedSymbolMeta = useMemo(() => {
    const local = mergedSymbols.find((s) => s.symbol === submittedSymbol);
    if (local) return local;
    const live = liveSearchQuery.data?.symbols.find((s) => s.symbol === submittedSymbol);
    return live ?? null;
  }, [mergedSymbols, submittedSymbol, liveSearchQuery.data]);

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
    const liveRaw = liveSearchQuery.data?.symbols ?? [];
    const live = exchangeFilter === "all" ? liveRaw : liveRaw.filter((s) => s.exchange === exchangeFilter);
    if (!q) return all.slice(0, 200);
    const starts: typeof all = [];
    const contains: typeof all = [];
    for (const s of all) {
      if (s.symbol.startsWith(q)) starts.push(s);
      else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q)) contains.push(s);
      if (starts.length >= 200) break;
    }
    const merged = [...starts, ...contains];
    const seen = new Set(merged.map((s) => s.symbol));
    for (const s of live) {
      if (!seen.has(s.symbol)) {
        seen.add(s.symbol);
        merged.push(s);
      }
    }
    return merged.slice(0, 200);
  }, [mergedSymbols, symbolInput, assetTypeFilter, exchangeFilter, liveSearchQuery.data]);

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

  function applyStrategy(kind: StrategyKind) {
    const wanted = STRATEGY_CHART_INDICATORS[kind] ?? [];
    const lang = pickLang(i18n.language);
    const label = STRATEGY_GUIDE[lang][kind].label;
    setActiveIndicators(wanted.map((k) => createActive(k)));
    setHiddenIds(new Set());
    setAppliedStrategy(kind);
    toast.success(t("analysis.strategyApplied", { added: wanted.length, strategy: label }));
  }

  function loadAnalysis(data: AnalysisLoadData) {
    const sym = sanitizeSymbol(data.symbol);
    setSymbolInput(data.symbol);
    setSubmittedSymbol(sym);
    setActiveIndicators(data.items);
    setHiddenIds(new Set());
    setLoadedAnalysisId(data.id);
    setLoadedAnalysisTitle(data.title);
    setLoadedAnalysisDescription(data.description);
    setRange(data.range as (typeof RANGES)[number]);
    setInterval(data.interval as (typeof INTERVALS)[number]);
    setConvertToCad(data.convertTo === "CAD");
    setConfidence(null);
    setAppliedStrategy(null);
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
    setAppliedStrategy(null);
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
    if (!trimmed) return;
    if (!SYMBOL_RE.test(trimmed)) {
      const match = suggestions.find(
        (s) => s.name.toUpperCase() === trimmed || s.symbol.toUpperCase() === trimmed,
      );
      if (match) {
        setSymbolInput(match.symbol);
        setSubmittedSymbol(match.symbol);
        return;
      }
      toast.error(t("analysis.pickFromList"));
      return;
    }
    setSubmittedSymbol(trimmed);
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
            {submittedSymbol && (
              <Button asChild size="sm" variant="outline" title={t("alerts.addFromAnalysis")}>
                <Link to="/dashboard/alerts" search={{ symbol: submittedSymbol }}>
                  <Bell className="mr-1 h-3.5 w-3.5" />
                  {t("alerts.addFromAnalysis")}
                </Link>
              </Button>
            )}
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
                onChange={(e) => setAssetTypeFilter(e.target.value as "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index")}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                <option value="all">{t("analysis.assetAll")}</option>
                <option value="stock">{t("analysis.assetStock")}</option>
                <option value="etf">{t("analysis.assetEtf")}</option>
                <option value="mutualfund">{t("analysis.assetMutualFund")}</option>
                <option value="commodity">{t("analysis.assetCommodity")}</option>
                <option value="crypto">{t("analysis.assetCrypto")}</option>
                <option value="index">{t("analysis.assetIndex")}</option>
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
                    {s.name} ({s.exchange}){s.assetType === "etf" ? " · ETF" : s.assetType === "commodity" ? " · Futures" : s.assetType === "mutualfund" ? " · Fund" : s.assetType === "crypto" ? " · Crypto" : s.assetType === "index" ? " · Index" : ""}
                  </option>
                ))}
              </datalist>
              {assetTypeFilter === "mutualfund" && suggestions.length === 0 && (
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {t("analysis.mutualFundHint")}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="range">{t("analysis.range")}</Label>
              <select
                id="range"
                value={range}
                onChange={(e) => setRange(e.target.value as RangeValue)}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                {compatibleRangesForInterval(interval).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="interval">{t("analysis.interval")}</Label>
              <select
                id="interval"
                value={interval}
                onChange={(e) => {
                  const next = e.target.value as IntervalValue;
                  setInterval(next);
                  setRange((r) => clampRangeForInterval(r, next));
                }}
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
          {isIntradayInterval(interval) && (
            <Link
              to="/dashboard/strategies"
              search={{ group: "intraday" }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              {t("analysis.intradayStrategiesHint")}
            </Link>
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
              <CardTitle className="text-base">
                {appliedStrategy
                  ? t("analysis.indicatorsAccordingToStrategy", {
                      strategy: STRATEGY_GUIDE[pickLang(i18n.language)][appliedStrategy].label,
                    })
                  : t("analysis.indicators")}
              </CardTitle>
            </button>
            <select
              aria-label={t("analysis.applyStrategy")}
              value=""
              onChange={(e) => {
                const v = e.target.value as StrategyKind | "";
                if (v) applyStrategy(v);
                e.target.value = "";
              }}
              className="h-9 max-w-[240px] rounded-md border border-[var(--color-border)] bg-transparent px-2 text-xs"
            >
              <option value="">{t("analysis.applyStrategy")}</option>
              {STRATEGY_KINDS.filter((k) => {
                if (!STRATEGY_CHART_INDICATORS[k]) return false;
                const isIntradayStrat = (STRATEGY_GROUPS.intraday as readonly StrategyKind[]).includes(k);
                return isIntradayInterval(interval) ? isIntradayStrat : !isIntradayStrat;
              }).map((k) => (
                <option key={k} value={k}>
                  {STRATEGY_GUIDE[pickLang(i18n.language)][k].label}
                </option>
              ))}
            </select>
          </CardHeader>
          {!indicatorsCollapsed && (
            <CardContent className="flex flex-col gap-3">
              <IndicatorLibrary onAdd={addIndicator} />
              <IndicatorList
                items={sortedActiveIndicators}
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
                <Markdown className="text-[var(--color-fg)]">{loadedAnalysisDescription}</Markdown>
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
            <CardContent className="space-y-3">
              {appliedStrategy && (
                <ProposedActionBanner
                  kind={appliedStrategy}
                  results={query.data.results}
                  candles={query.data.candles}
                  lang={pickLang(i18n.language)}
                />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:grid-cols-4">
                <LatestCandleCells candle={query.data.candles.at(-1) ?? null} prev={query.data.candles.at(-2) ?? null} />
                {query.data.results.map((r, i) => (
                  <LatestCell key={i} result={r} lastClose={query.data.candles.at(-1)?.close ?? null} />
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
                (_, i) => sortedActiveIndicators[i] && !hiddenIds.has(sortedActiveIndicators[i].localId),
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

const ACTION_STYLE: Record<StrategyAction, { border: string; badge: string; text: string }> = {
  buy: {
    border: "border-[#10b981]",
    badge: "bg-[#10b981] text-white",
    text: "text-[#10b981]",
  },
  sell: {
    border: "border-[#ef4444]",
    badge: "bg-[#ef4444] text-white",
    text: "text-[#ef4444]",
  },
  exitLong: {
    border: "border-[#f59e0b]",
    badge: "bg-[#f59e0b] text-black",
    text: "text-[#f59e0b]",
  },
  exitShort: {
    border: "border-[#f59e0b]",
    badge: "bg-[#f59e0b] text-black",
    text: "text-[#f59e0b]",
  },
  wait: {
    border: "border-[var(--color-border)]",
    badge: "bg-[var(--color-muted)] text-[var(--color-muted-fg)]",
    text: "text-[var(--color-muted-fg)]",
  },
};

function ProposedActionBanner({
  kind,
  results,
  candles,
  lang,
}: {
  kind: StrategyKind;
  results: RouterOutputs["market"]["analyze"]["results"];
  candles: RouterOutputs["market"]["analyze"]["candles"];
  lang: Lang;
}) {
  const { t } = useTranslation();
  const signal = useMemo(
    () => evaluateStrategy(kind, results, candles, lang),
    [kind, results, candles, lang],
  );
  if (!signal) return null;
  const style = ACTION_STYLE[signal.action];
  const strategyLabel = STRATEGY_GUIDE[lang][kind].label;

  return (
    <div className={`rounded-md border-2 ${style.border} p-3`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-[var(--color-muted-fg)]">
          {t("analysis.proposedActionFor", { strategy: strategyLabel })}
        </div>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase ${style.badge}`}>
          {t(`analysis.action.${signal.action}`)}
        </span>
      </div>
      {signal.reasons.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-[var(--color-muted-fg)]">
          {signal.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

type CandleLike = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function formatPrice(v: number): string {
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatVolume(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return "—";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(2) + "K";
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function LatestCandleCells({ candle, prev }: { candle: CandleLike | null; prev: CandleLike | null }) {
  const { t } = useTranslation();
  if (!candle) return null;
  const asOf = new Date(candle.time * 1000).toLocaleDateString();
  const changePct =
    prev && Number.isFinite(prev.close) && prev.close > 0
      ? ((candle.close - prev.close) / prev.close) * 100
      : null;
  const changeTone =
    changePct == null ? TONE_MUTED : changePct > 0 ? TONE_POS : changePct < 0 ? TONE_NEG : TONE_MUTED;
  const changeText =
    changePct == null ? null : `${changePct > 0 ? "+" : ""}${changePct.toFixed(2)}%`;
  const cells: Array<{ label: string; value: string; hint?: string | null; tone?: string }> = [
    { label: t("analysis.candle.open"), value: formatPrice(candle.open) },
    { label: t("analysis.candle.high"), value: formatPrice(candle.high) },
    { label: t("analysis.candle.low"), value: formatPrice(candle.low) },
    { label: t("analysis.candle.close"), value: formatPrice(candle.close), hint: changeText, tone: changeTone },
    { label: t("analysis.candle.volume"), value: formatVolume(candle.volume) },
  ];
  return (
    <>
      {cells.map((c, i) => (
        <div key={`candle-${i}`} className="rounded-md border border-[var(--color-border)] p-3">
          <div className="text-xs text-[var(--color-muted-fg)]">{c.label}</div>
          <div className="mt-1 font-mono">{c.value}</div>
          {c.hint ? (
            <div className={"mt-1 text-xs " + (c.tone ?? TONE_MUTED)}>{c.hint}</div>
          ) : i === 0 ? (
            <div className="mt-1 text-xs text-[var(--color-muted-fg)]">{asOf}</div>
          ) : null}
        </div>
      ))}
    </>
  );
}

function LatestCell({ result, lastClose }: { result: AnalyzeResult; lastClose: number | null }) {
  const { t } = useTranslation();
  const last = latestEntry(result);
  const label = cellLabel(result);
  const hint = last ? interpretResult(result, last, lastClose, t) : null;

  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="text-xs text-[var(--color-muted-fg)]">{label}</div>
      <div className="mt-1 font-mono">{last ? formatLast(result.kind, last) : "—"}</div>
      {hint && <div className={"mt-1 text-xs " + hint.tone}>{hint.text}</div>}
    </div>
  );
}

type Hint = { text: string; tone: string };
const TONE_POS = "text-[#10b981]";
const TONE_NEG = "text-[#ef4444]";
const TONE_WARN = "text-[#f59e0b]";
const TONE_MUTED = "text-[var(--color-muted-fg)]";

function interpretResult(
  result: AnalyzeResult,
  last: Record<string, unknown>,
  lastClose: number | null,
  t: (k: string) => string,
): Hint | null {
  const kind = result.kind;
  const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

  if (kind === "sma" || kind === "ema" || kind === "rma" || kind === "wma" || kind === "dema") {
    const v = num(last.value);
    if (v == null || lastClose == null) return null;
    const pct = ((lastClose - v) / v) * 100;
    if (lastClose > v) return { text: t("analysis.hint.priceAbove") + ` (+${pct.toFixed(1)}%)`, tone: TONE_POS };
    return { text: t("analysis.hint.priceBelow") + ` (${pct.toFixed(1)}%)`, tone: TONE_NEG };
  }

  if (kind === "rsi") {
    const v = num(last.value);
    if (v == null) return null;
    if (v >= 70) return { text: t("analysis.hint.overbought"), tone: TONE_WARN };
    if (v <= 30) return { text: t("analysis.hint.oversold"), tone: TONE_WARN };
    if (v >= 55) return { text: t("analysis.hint.bullishBias"), tone: TONE_POS };
    if (v <= 45) return { text: t("analysis.hint.bearishBias"), tone: TONE_NEG };
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "stochRsi") {
    const v = num(last.value);
    if (v == null) return null;
    const scaled = v > 1 ? v : v * 100;
    if (scaled >= 80) return { text: t("analysis.hint.overbought"), tone: TONE_WARN };
    if (scaled <= 20) return { text: t("analysis.hint.oversold"), tone: TONE_WARN };
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "stoch") {
    const k = num(last.k);
    const d = num(last.d);
    if (k == null) return null;
    if (k >= 80) return { text: t("analysis.hint.overbought"), tone: TONE_WARN };
    if (k <= 20) return { text: t("analysis.hint.oversold"), tone: TONE_WARN };
    if (d != null) {
      if (k > d) return { text: t("analysis.hint.bullishBias"), tone: TONE_POS };
      if (k < d) return { text: t("analysis.hint.bearishBias"), tone: TONE_NEG };
    }
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "williamsR") {
    const v = num(last.value);
    if (v == null) return null;
    if (v >= -20) return { text: t("analysis.hint.overbought"), tone: TONE_WARN };
    if (v <= -80) return { text: t("analysis.hint.oversold"), tone: TONE_WARN };
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "mom") {
    const v = num(last.value);
    if (v == null) return null;
    if (v > 0) return { text: t("analysis.hint.momentumUp"), tone: TONE_POS };
    if (v < 0) return { text: t("analysis.hint.momentumDown"), tone: TONE_NEG };
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "roc") {
    const v = num(last.value);
    if (v == null) return null;
    if (v > 0) return { text: t("analysis.hint.gaining") + ` (+${v.toFixed(1)}%)`, tone: TONE_POS };
    if (v < 0) return { text: t("analysis.hint.losing") + ` (${v.toFixed(1)}%)`, tone: TONE_NEG };
    return { text: t("analysis.hint.flat"), tone: TONE_MUTED };
  }

  if (kind === "macd") {
    const m = num(last.macd);
    const s = num(last.signal);
    const h = num(last.histogram);
    if (m == null || s == null) return null;
    if (m > s && (h ?? 0) > 0) return { text: t("analysis.hint.bullishCross"), tone: TONE_POS };
    if (m < s && (h ?? 0) < 0) return { text: t("analysis.hint.bearishCross"), tone: TONE_NEG };
    return { text: t("analysis.hint.neutral"), tone: TONE_MUTED };
  }

  if (kind === "macdCross") {
    const ev = last.event;
    if (ev === "bull") return { text: t("analysis.hint.bullishCross"), tone: TONE_POS };
    if (ev === "bear") return { text: t("analysis.hint.bearishCross"), tone: TONE_NEG };
    return { text: t("analysis.hint.noRecentCross"), tone: TONE_MUTED };
  }

  if (kind === "maCross") {
    const ev = last.event;
    const fast = num(last.fast);
    const slow = num(last.slow);
    if (ev === "bull") return { text: t("analysis.hint.goldenCross"), tone: TONE_POS };
    if (ev === "bear") return { text: t("analysis.hint.deathCross"), tone: TONE_NEG };
    if (fast != null && slow != null) {
      if (fast > slow) return { text: t("analysis.hint.fastAboveSlow"), tone: TONE_POS };
      if (fast < slow) return { text: t("analysis.hint.fastBelowSlow"), tone: TONE_NEG };
    }
    return null;
  }

  if (kind === "bbands") {
    const upper = num(last.upper);
    const lower = num(last.lower);
    const middle = num(last.middle);
    if (upper == null || lower == null || middle == null || lastClose == null) return null;
    const width = upper - lower;
    if (width <= 0) return null;
    const pos = (lastClose - lower) / width;
    if (pos >= 0.95) return { text: t("analysis.hint.nearUpperBand"), tone: TONE_WARN };
    if (pos <= 0.05) return { text: t("analysis.hint.nearLowerBand"), tone: TONE_WARN };
    if (pos >= 0.5) return { text: t("analysis.hint.bullishBias"), tone: TONE_POS };
    return { text: t("analysis.hint.bearishBias"), tone: TONE_NEG };
  }

  if (kind === "atr") {
    const v = num(last.value);
    if (v == null || lastClose == null || lastClose === 0) return null;
    const pct = (v / lastClose) * 100;
    if (pct >= 3) return { text: t("analysis.hint.highVolatility") + ` (${pct.toFixed(1)}%)`, tone: TONE_WARN };
    if (pct <= 1) return { text: t("analysis.hint.lowVolatility") + ` (${pct.toFixed(1)}%)`, tone: TONE_MUTED };
    return { text: t("analysis.hint.moderateVolatility") + ` (${pct.toFixed(1)}%)`, tone: TONE_MUTED };
  }

  if (kind === "adx") {
    const adx = num(last.adx);
    const pdi = num(last.pdi);
    const mdi = num(last.mdi);
    if (adx == null) return null;
    if (adx < 20) return { text: t("analysis.hint.noTrend"), tone: TONE_MUTED };
    const strong = adx >= 40;
    if (pdi != null && mdi != null) {
      if (pdi > mdi) return { text: (strong ? t("analysis.hint.strongUptrend") : t("analysis.hint.uptrend")), tone: TONE_POS };
      if (mdi > pdi) return { text: (strong ? t("analysis.hint.strongDowntrend") : t("analysis.hint.downtrend")), tone: TONE_NEG };
    }
    return { text: t("analysis.hint.trending"), tone: TONE_MUTED };
  }

  if (kind === "psar") {
    const v = num(last.value);
    if (v == null || lastClose == null) return null;
    if (v < lastClose) return { text: t("analysis.hint.uptrend"), tone: TONE_POS };
    return { text: t("analysis.hint.downtrend"), tone: TONE_NEG };
  }

  if (kind === "obv") {
    return { text: t("analysis.hint.obvHint"), tone: TONE_MUTED };
  }

  if (kind === "vwap") {
    const v = num(last.value);
    if (v == null || lastClose == null) return null;
    if (lastClose > v) return { text: t("analysis.hint.aboveVwap"), tone: TONE_POS };
    if (lastClose < v) return { text: t("analysis.hint.belowVwap"), tone: TONE_NEG };
    return { text: t("analysis.hint.atVwap"), tone: TONE_MUTED };
  }

  if (kind === "fib") {
    const hi = num(last.swingHigh);
    const lo = num(last.swingLow);
    if (hi == null || lo == null || lastClose == null || hi <= lo) return null;
    const retracement = ((hi - lastClose) / (hi - lo)) * 100;
    if (retracement <= 0) return { text: t("analysis.hint.fibAboveHigh"), tone: TONE_POS };
    if (retracement >= 100) return { text: t("analysis.hint.fibBelowLow"), tone: TONE_NEG };
    const pctLabel = `${retracement.toFixed(1)}%`;
    if (retracement < 38.2) return { text: `${t("analysis.hint.fibShallow")} (${pctLabel})`, tone: TONE_POS };
    if (retracement <= 61.8) return { text: `${t("analysis.hint.fibGolden")} (${pctLabel})`, tone: TONE_WARN };
    return { text: `${t("analysis.hint.fibDeep")} (${pctLabel})`, tone: TONE_NEG };
  }

  return null;
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
  if (result.kind === "fib") {
    if (result.series == null) return undefined;
    const s = result.series;
    return {
      direction: s.direction,
      swingHigh: s.swingHigh,
      swingLow: s.swingLow,
      level382: s.levels.find((l) => l.ratio === 0.382)?.price,
      level500: s.levels.find((l) => l.ratio === 0.5)?.price,
      level618: s.levels.find((l) => l.ratio === 0.618)?.price,
    };
  }
  if (result.kind === "liqSweep") {
    const e = result.series.events.at(-1);
    return e ? { type: e.type, level: e.level, wick: e.wickPrice, time: e.time } : undefined;
  }
  if (result.kind === "fvg") {
    const g = result.series.gaps.at(-1);
    return g
      ? { type: g.type, top: g.top, bottom: g.bottom, filled: g.filled, time: g.time }
      : undefined;
  }
  if (result.kind === "srLevels") {
    const top = result.series.levels[0];
    return top
      ? { price: top.price, touches: top.touches, type: top.type, count: result.series.levels.length }
      : undefined;
  }
  if (result.kind === "pivots") {
    const last = result.series.periods.at(-1);
    if (!last) return undefined;
    const out: Record<string, number> = { time: last.startTime };
    for (const l of last.levels) out[l.label] = l.price;
    return out;
  }
  if (result.kind === "volProfile") {
    return { poc: result.series.poc, vah: result.series.vah, val: result.series.val };
  }
  if (result.kind === "orderBlock") {
    const b = result.series.blocks.at(-1);
    return b
      ? { type: b.type, top: b.top, bottom: b.bottom, mitigated: b.mitigated, time: b.time }
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
    case "vwap":
      return "VWAP";
    case "fib":
      return result.spec.lookback != null ? `FIB (${result.spec.lookback})` : "FIB";
    case "psar":
      return `PSAR ${result.spec.step}/${result.spec.max}`;
    case "maCross":
      return `${result.spec.maType.toUpperCase()} CROSS ${result.spec.fastPeriod}/${result.spec.slowPeriod}`;
    case "macdCross":
      return `MACD CROSS ${result.spec.fast}/${result.spec.slow}/${result.spec.signal}`;
    case "keltner":
      return `KELTNER ${result.spec.period}/${result.spec.atrPeriod}×${result.spec.multiplier}`;
    case "donchian":
      return `DONCHIAN ${result.spec.period}`;
    case "chaikinVol":
      return `CHAIKIN VOL ${result.spec.emaPeriod}/${result.spec.rocPeriod}`;
    case "ad":
      return "A/D";
    case "cmf":
      return `CMF ${result.spec.period}`;
    case "volOsc":
      return `VOL OSC ${result.spec.fast}/${result.spec.slow}`;
    case "aroon":
      return `AROON ${result.spec.period}`;
    case "vortex":
      return `VORTEX ${result.spec.period}`;
    case "tii":
      return `TII ${result.spec.majorPeriod}/${result.spec.minorPeriod}`;
    case "zscore":
      return `Z-SCORE ${result.spec.period}`;
    case "bbPctB":
      return `BB%B ${result.spec.period}/${result.spec.stdDev}`;
    case "hurst":
      return `HURST ${result.spec.period}`;
    case "liqSweep":
      return `LIQ SWEEP ${result.spec.lookback}`;
    case "fvg":
      return `FVG ${result.spec.lookback}${result.spec.showFilled ? "+" : ""}`;
    case "srLevels":
      return `S/R ${result.spec.lookback}/${result.spec.strength}`;
    case "pivots":
      return `PIVOTS ${result.spec.method.toUpperCase()} ${result.spec.timeframe}`;
    case "volProfile":
      return `VP ${result.spec.lookback}/${result.spec.bins}`;
    case "orderBlock":
      return `OB ${result.spec.lookback}/${result.spec.impulsePct}%`;
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
  if (kind === "fib") {
    return `${fmt(last.level382)} / ${fmt(last.level500)} / ${fmt(last.level618)}`;
  }
  if (kind === "keltner" || kind === "donchian") {
    return `${fmt(last.upper)} / ${fmt(last.middle)} / ${fmt(last.lower)}`;
  }
  if (kind === "aroon") {
    return `Up ${fmt(last.up)} / Down ${fmt(last.down)}`;
  }
  if (kind === "vortex") {
    return `+${fmt(last.plus)} / −${fmt(last.minus)}`;
  }
  if (kind === "liqSweep") {
    if (last.type == null) return "—";
    const arrow = last.type === "high" ? "↓" : "↑";
    return `${arrow} ${fmt(last.level)}`;
  }
  if (kind === "fvg") {
    if (last.type == null) return "—";
    const arrow = last.type === "bullish" ? "↑" : "↓";
    const tag = last.filled ? " (filled)" : "";
    return `${arrow} ${fmt(last.bottom)}–${fmt(last.top)}${tag}`;
  }
  if (kind === "srLevels") {
    if (last.price == null) return "—";
    const arrow = last.type === "support" ? "↑" : "↓";
    const c = typeof last.count === "number" ? ` · ${last.count}` : "";
    return `${arrow} ${fmt(last.price)} ×${fmt(last.touches)}${c}`;
  }
  if (kind === "pivots") {
    return `PP ${fmt(last.PP)} · R1 ${fmt(last.R1)} · S1 ${fmt(last.S1)}`;
  }
  if (kind === "volProfile") {
    return `POC ${fmt(last.poc)} · VAH ${fmt(last.vah)} · VAL ${fmt(last.val)}`;
  }
  if (kind === "orderBlock") {
    if (last.type == null) return "—";
    const arrow = last.type === "bullish" ? "↑" : "↓";
    const tag = last.mitigated ? " (mit.)" : "";
    return `${arrow} ${fmt(last.bottom)}–${fmt(last.top)}${tag}`;
  }
  return fmt(last.value);
}
