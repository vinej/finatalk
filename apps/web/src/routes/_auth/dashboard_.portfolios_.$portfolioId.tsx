import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronDown, ChevronRight, ClipboardCheck, DollarSign, Download, FileText, LineChart, Loader2, MessageSquare, Pencil, Plus, RefreshCw, Replace, Sparkles, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AllocationDonut, colorFor, type DonutSegment } from "@/components/portfolio/allocation-donut";
import { GenerateAnalysisDialog } from "@/components/portfolio/generate-analysis-dialog";
import { PortfolioChatDrawer } from "@/components/portfolio/portfolio-chat-drawer";
import { Markdown } from "@/components/ai/markdown";
import { PortfolioPerformanceChart, type PerformanceRange } from "@/components/portfolio/portfolio-performance-chart";
import {
  PortfolioVsBenchmarkChart,
  type BenchmarkKey,
} from "@/components/portfolio/portfolio-vs-benchmark-chart";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearLastPortfolioId,
  saveLastPortfolioId,
} from "@/lib/portfolio-persistence";
import { trpc } from "@/lib/trpc";
import type { RouterOutputs } from "@finatalk/trpc";

export const Route = createFileRoute("/_auth/dashboard_/portfolios_/$portfolioId")({
  component: PortfolioDetailPage,
});

type ValuationRow = RouterOutputs["portfolio"]["getValuation"]["rows"][number];
type SortKey = "symbol" | "quantity" | "costBasis" | "purchaseDate" | "lastClose" | "marketValue" | "unrealizedAbs";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatPct(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatQty(q: number) {
  return q.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function PortfolioDetailPage() {
  const { portfolioId } = Route.useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const portfolioQuery = trpc.portfolio.getPortfolio.useQuery({ id: portfolioId });

  useEffect(() => {
    if (portfolioQuery.data) saveLastPortfolioId(portfolioId);
  }, [portfolioId, portfolioQuery.data]);

  useEffect(() => {
    if (portfolioQuery.error?.data?.code === "NOT_FOUND") {
      clearLastPortfolioId();
    }
  }, [portfolioQuery.error]);
  const valuationQuery = trpc.portfolio.getValuation.useQuery({ id: portfolioId });
  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [txHoldingId, setTxHoldingId] = useState<string | null>(null);
  const [editingHoldingId, setEditingHoldingId] = useState<string | null>(null);
  const [holdingDraft, setHoldingDraft] = useState({
    symbol: "",
    quantity: "",
    costBasis: "",
    purchaseDate: todayIso(),
  });
  const [newSymbol, setNewSymbol] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newDate, setNewDate] = useState(todayIso());
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "stock" | "etf">("all");
  const [linking, setLinking] = useState<{
    holdingId: string;
    symbol: string;
    currentAnalysisId: string | null;
  } | null>(null);
  const [generatingFor, setGeneratingFor] = useState<{ holdingId: string; symbol: string } | null>(null);
  const [infoHolding, setInfoHolding] = useState<{
    holdingId: string;
    symbol: string;
    analysisId: string;
  } | null>(null);

  const [confidenceMap, setConfidenceMap] = useState<Map<string, "high" | "medium" | "low">>(new Map());
  const [refreshingConfidence, setRefreshingConfidence] = useState(false);
  const [confidenceProgress, setConfidenceProgress] = useState("");
  const [performanceRange, setPerformanceRange] = useState<PerformanceRange>("6mo");
  const [benchmarkRange, setBenchmarkRange] = useState<PerformanceRange>("6mo");
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<BenchmarkKey[]>(["sp500"]);
  const [benchmarkCollapsed, setBenchmarkCollapsed] = useState(true);
  const confidenceAbortRef = useRef(false);
  const confidenceInitRef = useRef(false);

  const confidenceMutation = trpc.research.getConfidence.useMutation();
  const saveConfidence = trpc.portfolio.updateHoldingConfidence.useMutation();

  async function refreshAllConfidence() {
    const symbols = [...new Set(holdings.map((h) => h.symbol.toUpperCase()))];
    if (symbols.length === 0) return;
    const total = symbols.length;
    const delayMs = 60_000;
    setRefreshingConfidence(true);
    confidenceAbortRef.current = false;
    for (let i = 0; i < total; i++) {
      if (confidenceAbortRef.current) break;
      const remaining = (total - i - 1) * 60;
      setConfidenceProgress(
        `${i + 1}/${total}` + (remaining > 0 ? ` · ~${Math.ceil(remaining / 60)} min` : ""),
      );
      try {
        const result = await confidenceMutation.mutateAsync({ symbol: symbols[i], language: i18n.language });
        setConfidenceMap((prev) => {
          const next = new Map(prev);
          next.set(result.symbol.toUpperCase(), result.confidence);
          return next;
        });
        await saveConfidence.mutateAsync({
          portfolioId,
          symbol: result.symbol,
          confidence: result.confidence,
        });
      } catch {
        // continue with next symbol
      }
      if (i < total - 1 && !confidenceAbortRef.current) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    setRefreshingConfidence(false);
    setConfidenceProgress("");
  }

  function cancelConfidenceRefresh() {
    confidenceAbortRef.current = true;
  }

  const analysesQuery = trpc.analysis.listAnalyses.useQuery(
    linking ? { symbol: linking.symbol } : undefined,
    { enabled: linking != null },
  );

  const linkAnalysis = trpc.portfolio.linkAnalysisToHolding.useMutation({
    onSuccess: async (_data, vars) => {
      await Promise.all([
        utils.portfolio.getPortfolio.invalidate({ id: portfolioId }),
        utils.portfolio.getValuation.invalidate({ id: portfolioId }),
      ]);
      setLinking(null);
      toast.success(
        vars.analysisId == null ? t("portfolio.analysisUnlinked") : t("portfolio.analysisLinked"),
      );
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePortfolio = trpc.portfolio.updatePortfolio.useMutation({
    onSuccess: async () => {
      await utils.portfolio.getPortfolio.invalidate({ id: portfolioId });
      await utils.portfolio.listPortfolios.invalidate();
      setEditingTitle(false);
      toast.success(t("portfolio.updated"));
    },
    onError: (e, variables) => {
      if (e.data?.code === "CONFLICT" && variables.title) {
        toast.error(t("portfolio.duplicateTitle"));
        return;
      }
      toast.error(e.message);
    },
  });

  const deletePortfolio = trpc.portfolio.deletePortfolio.useMutation({
    onSuccess: async () => {
      clearLastPortfolioId();
      await utils.portfolio.listPortfolios.invalidate();
      toast.success(t("portfolio.deleted"));
      navigate({ to: "/dashboard/portfolios" });
    },
    onError: (e) => toast.error(e.message),
  });

  const addHolding = trpc.portfolio.addHolding.useMutation({
    onSuccess: async () => {
      await utils.portfolio.getPortfolio.invalidate({ id: portfolioId });
      await utils.portfolio.getValuation.invalidate({ id: portfolioId });
      setNewSymbol("");
      setNewQty("");
      setNewCost("");
      setNewDate(todayIso());
      toast.success(t("portfolio.holdingAdded"));
    },
    onError: (e) => toast.error(e.message),
  });

  const updateHolding = trpc.portfolio.updateHolding.useMutation({
    onSuccess: async () => {
      await utils.portfolio.getPortfolio.invalidate({ id: portfolioId });
      await utils.portfolio.getValuation.invalidate({ id: portfolioId });
      setEditingHoldingId(null);
      toast.success(t("portfolio.holdingUpdated"));
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteHolding = trpc.portfolio.deleteHolding.useMutation({
    onSuccess: async () => {
      await utils.portfolio.getPortfolio.invalidate({ id: portfolioId });
      await utils.portfolio.getValuation.invalidate({ id: portfolioId });
      toast.success(t("portfolio.holdingDeleted"));
    },
    onError: (e) => toast.error(e.message),
  });

  const reportMutation = trpc.portfolio.generateReport.useMutation({
    onSuccess: (data) => {
      const binary = atob(data.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("portfolio.reportGenerated"));
    },
    onError: (e) => toast.error(e.message ?? t("portfolio.reportFailed")),
  });

  const rows = valuationQuery.data?.rows ?? [];
  const holdings = portfolioQuery.data?.holdings ?? [];
  const currency = portfolioQuery.data?.currency ?? "USD";
  const totals = valuationQuery.data?.totals;

  useEffect(() => {
    if (confidenceInitRef.current || holdings.length === 0) return;
    confidenceInitRef.current = true;
    const m = new Map<string, "high" | "medium" | "low">();
    for (const h of holdings) {
      if (h.confidence) m.set(h.symbol.toUpperCase(), h.confidence);
    }
    if (m.size > 0) setConfidenceMap(m);
  }, [holdings]);

  const analysisTitleByHolding = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const h of holdings) m.set(h.id, h.analysisTitle);
    return m;
  }, [holdings]);

  const analysisDescByHolding = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const h of holdings) m.set(h.id, h.analysisDescription);
    return m;
  }, [holdings]);

  const symbolNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of symbolsQuery.data?.symbols ?? []) m.set(s.symbol, s.name);
    return m;
  }, [symbolsQuery.data]);

  const symbolQuery =
    editingHoldingId != null ? holdingDraft.symbol : newSymbol;
  const symbolSuggestions = useMemo(() => {
    const raw = symbolsQuery.data?.symbols ?? [];
    const all = assetTypeFilter === "all" ? raw : raw.filter((s) => s.assetType === assetTypeFilter);
    const q = symbolQuery.trim().toUpperCase();
    if (!q) return all.slice(0, 200);
    const starts: typeof all = [];
    const contains: typeof all = [];
    for (const s of all) {
      if (s.symbol.startsWith(q)) starts.push(s);
      else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q)) contains.push(s);
      if (starts.length >= 200) break;
    }
    return [...starts, ...contains].slice(0, 200);
  }, [symbolsQuery.data, symbolQuery, assetTypeFilter]);

  const newSymbolResolved = useMemo(() => {
    const q = newSymbol.trim().toUpperCase();
    if (!q) return null;
    const all = symbolsQuery.data?.symbols;
    if (!all) return null;
    return all.some((s) => s.symbol === q) ? q : null;
  }, [newSymbol, symbolsQuery.data]);

  const newSymbolPriceQuery = trpc.market.candles.useQuery(
    {
      symbol: newSymbolResolved ?? "",
      range: "1mo",
      interval: "1d",
      convertTo: currency === "CAD" ? "CAD" : null,
    },
    {
      enabled: editingHoldingId == null && !!newSymbolResolved,
      staleTime: 60_000,
      retry: false,
    },
  );

  const autoFilledCostForSymbol = useRef<string | null>(null);
  useEffect(() => {
    if (editingHoldingId != null) return;
    if (!newSymbolResolved) {
      autoFilledCostForSymbol.current = null;
      return;
    }
    if (autoFilledCostForSymbol.current === newSymbolResolved) return;
    const candles = newSymbolPriceQuery.data?.candles;
    if (!candles || candles.length === 0) return;
    const last = candles[candles.length - 1];
    if (!last || !Number.isFinite(last.close)) return;
    setNewCost(last.close.toFixed(2));
    autoFilledCostForSymbol.current = newSymbolResolved;
  }, [editingHoldingId, newSymbolResolved, newSymbolPriceQuery.data]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    const mult = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * mult;
      return ((av as number) - (bv as number)) * mult;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const segments = useMemo<DonutSegment[]>(() => {
    const valued = rows.filter((r) => r.marketValue != null && r.marketValue > 0);
    return valued.map((r, i) => ({
      label: r.holding.symbol,
      value: r.marketValue ?? 0,
      color: colorFor(r.holding.symbol, i),
    }));
  }, [rows]);

  const performanceItems = useMemo(() => {
    const seen = new Set<string>();
    const out: { symbol: string; color: string }[] = [];
    for (const seg of segments) {
      if (seen.has(seg.label)) continue;
      seen.add(seg.label);
      out.push({ symbol: seg.label, color: seg.color });
    }
    return out;
  }, [segments]);

  const benchmarkHoldings = useMemo(() => {
    const totals = new Map<string, number>();
    for (const r of rows) {
      const qty = r.holding.quantity;
      if (!Number.isFinite(qty) || qty <= 0) continue;
      totals.set(r.holding.symbol, (totals.get(r.holding.symbol) ?? 0) + qty);
    }
    return [...totals.entries()].map(([symbol, quantity]) => ({ symbol, quantity }));
  }, [rows]);

  function sortValue(r: ValuationRow, key: SortKey): string | number | null {
    switch (key) {
      case "symbol":
        return r.holding.symbol;
      case "quantity":
        return r.holding.quantity;
      case "costBasis":
        return r.holding.costBasis;
      case "purchaseDate":
        return r.holding.purchaseDate;
      case "lastClose":
        return r.lastClose;
      case "marketValue":
        return r.marketValue;
      case "unrealizedAbs":
        return r.unrealizedAbs;
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "symbol" || key === "purchaseDate" ? "asc" : "desc");
    }
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(newQty);
    const cost = Number(newCost);
    if (!newSymbol.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost < 0) return;
    addHolding.mutate({
      portfolioId,
      holding: {
        symbol: newSymbol.trim().toUpperCase(),
        quantity: qty,
        costBasis: cost,
        purchaseDate: newDate,
      },
    });
  }

  function startEditHolding(h: {
    id: string;
    symbol: string;
    quantity: number;
    costBasis: number;
    purchaseDate: string;
  }) {
    setEditingHoldingId(h.id);
    setHoldingDraft({
      symbol: h.symbol,
      quantity: String(h.quantity),
      costBasis: String(h.costBasis),
      purchaseDate: h.purchaseDate,
    });
  }

  function submitEditHolding() {
    const qty = Number(holdingDraft.quantity);
    const cost = Number(holdingDraft.costBasis);
    if (!holdingDraft.symbol.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost < 0)
      return;
    if (!editingHoldingId) return;
    updateHolding.mutate({
      id: editingHoldingId,
      holding: {
        symbol: holdingDraft.symbol.trim().toUpperCase(),
        quantity: qty,
        costBasis: cost,
        purchaseDate: holdingDraft.purchaseDate,
      },
    });
  }

  function confirmDelete() {
    if (!portfolioQuery.data) return;
    if (window.confirm(t("portfolio.confirmDelete", { title: portfolioQuery.data.title }))) {
      deletePortfolio.mutate({ id: portfolioId });
    }
  }

  if (portfolioQuery.isLoading) {
    return <p className="p-4 text-sm text-[var(--color-muted-fg)]">{t("portfolio.loading")}</p>;
  }
  if (!portfolioQuery.data) {
    return <p className="p-4 text-sm text-[var(--color-muted-fg)]">{t("portfolio.notFound")}</p>;
  }

  const p = portfolioQuery.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-muted-fg)]">
        <Link to="/dashboard/portfolios" className="flex items-center gap-1 hover:text-[var(--color-fg)]">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("nav.portfolios")}
        </Link>
      </div>

      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = titleDraft.trim();
                if (!v || v === p.title) {
                  setEditingTitle(false);
                  return;
                }
                updatePortfolio.mutate({ id: portfolioId, title: v });
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                maxLength={120}
                autoFocus
                className="h-8 w-64"
              />
              <Button type="submit" size="sm">
                {t("portfolio.save")}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditingTitle(false)}>
                {t("portfolio.cancel")}
              </Button>
            </form>
          ) : (
            <>
              <h1 className="text-lg font-semibold">{p.title}</h1>
              <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-medium">
                {p.currency}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTitleDraft(p.title);
                  setEditingTitle(true);
                }}
                aria-label={t("portfolio.renamePortfolio")}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => reportMutation.mutate({ id: portfolioId, locale: i18n.language, range: performanceRange })}
            disabled={reportMutation.isPending || holdings.length === 0}
          >
            {reportMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1 h-4 w-4" />
            )}
            {t("portfolio.downloadReport")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setChatInitialPrompt(t("portfolio.reviewPrompt"));
              setChatOpen(true);
            }}
            disabled={holdings.length === 0}
          >
            <ClipboardCheck className="mr-1 h-4 w-4" />
            {t("portfolio.reviewPortfolio")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setChatInitialPrompt(null);
              setChatOpen(true);
            }}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            {t("portfolio.askAi")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={confirmDelete}
            disabled={deletePortfolio.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {t("portfolio.delete")}
          </Button>
        </div>
      </header>

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t("portfolio.totals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <TotalTile
                label={t("portfolio.marketValue")}
                value={totals ? formatCurrency(totals.marketValue, currency) : "—"}
              />
              <TotalTile
                label={t("portfolio.costTotal")}
                value={totals ? formatCurrency(totals.costTotal, currency) : "—"}
              />
              <TotalTile
                label={t("portfolio.unrealizedAbs")}
                value={totals ? formatCurrency(totals.unrealizedAbs, currency) : "—"}
                tone={totals ? (totals.unrealizedAbs >= 0 ? "pos" : "neg") : "neutral"}
              />
              <TotalTile
                label={t("portfolio.unrealizedPct")}
                value={totals ? formatPct(totals.unrealizedPct) : "—"}
                tone={totals && totals.unrealizedPct != null ? (totals.unrealizedPct >= 0 ? "pos" : "neg") : "neutral"}
              />
            </div>
            {valuationQuery.data && (
              <p className="mt-3 text-xs text-[var(--color-muted-fg)]">
                {t("portfolio.asOf", { date: new Date(valuationQuery.data.asOf).toLocaleString() })}
              </p>
            )}
            {performanceItems.length > 0 && (
              <PortfolioPerformanceChart
                items={performanceItems}
                currency={currency}
                range={performanceRange}
                onRangeChange={setPerformanceRange}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t("portfolio.allocation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationDonut
              segments={segments}
              formatValue={(v, share) =>
                `${formatCurrency(v, currency)} · ${(share * 100).toFixed(1)}%`
              }
            />
          </CardContent>
        </Card>
      </div>

      {benchmarkHoldings.length > 0 && (
        <Card className="mb-4">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setBenchmarkCollapsed((v) => !v)}
          >
            <div className="flex items-center gap-2">
              {benchmarkCollapsed ? (
                <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
              )}
              <CardTitle className="text-sm font-semibold">
                {t("portfolio.benchmarkTitle")}
              </CardTitle>
            </div>
          </CardHeader>
          {!benchmarkCollapsed && (
            <CardContent>
              <PortfolioVsBenchmarkChart
                holdings={benchmarkHoldings}
                currency={currency}
                range={benchmarkRange}
                onRangeChange={setBenchmarkRange}
                selected={selectedBenchmarks}
                onSelectedChange={setSelectedBenchmarks}
              />
            </CardContent>
          )}
        </Card>
      )}

      <DividendSection symbols={[...new Set(holdings.map((h) => h.symbol.toUpperCase()))]} holdings={holdings} currency={currency} />

      {p.manageTransactions && <TaxSummarySection portfolioId={portfolioId} currency={currency} />}

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">{t("portfolio.holdings")}</CardTitle>
            <div className="flex items-center gap-2">
              <label
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs"
                title={t("portfolio.manageTransactionsHint")}
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5"
                  checked={p.manageTransactions}
                  onChange={(e) =>
                    updatePortfolio.mutate({ id: portfolioId, manageTransactions: e.target.checked })
                  }
                  disabled={updatePortfolio.isPending}
                />
                <span>{t("portfolio.manageTransactions")}</span>
              </label>
              {confidenceProgress && (
                <span className="text-xs text-[var(--color-muted-fg)]">{confidenceProgress}</span>
              )}
              {refreshingConfidence ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[var(--color-muted-fg)]" aria-hidden />
                  <button
                    type="button"
                    onClick={cancelConfidenceRefresh}
                    title={t("portfolio.cancel")}
                    className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={refreshAllConfidence}
                  disabled={holdings.length === 0}
                  title={t("portfolio.refreshAllConfidence")}
                  className="rounded p-1.5 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)] disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
                  <Th onClick={() => toggleSort("symbol")} active={sortKey === "symbol"} dir={sortDir}>
                    {t("portfolio.symbol")}
                  </Th>
                  <Th onClick={() => toggleSort("quantity")} active={sortKey === "quantity"} dir={sortDir} align="right">
                    {t("portfolio.quantity")}
                  </Th>
                  <Th onClick={() => toggleSort("costBasis")} active={sortKey === "costBasis"} dir={sortDir} align="right">
                    {t("portfolio.avgCost")}
                  </Th>
                  <Th onClick={() => toggleSort("purchaseDate")} active={sortKey === "purchaseDate"} dir={sortDir}>
                    {t("portfolio.purchaseDate")}
                  </Th>
                  <Th onClick={() => toggleSort("lastClose")} active={sortKey === "lastClose"} dir={sortDir} align="right">
                    {t("portfolio.lastPrice")}
                  </Th>
                  <Th onClick={() => toggleSort("marketValue")} active={sortKey === "marketValue"} dir={sortDir} align="right">
                    {t("portfolio.marketValue")}
                  </Th>
                  <Th onClick={() => toggleSort("unrealizedAbs")} active={sortKey === "unrealizedAbs"} dir={sortDir} align="right">
                    {t("portfolio.unrealizedPl")}
                  </Th>
                  <th className="px-2 py-2 text-xs font-medium uppercase text-[var(--color-muted-fg)]">
                    {t("portfolio.analysis")}
                  </th>
                  <th className="px-2 py-2 text-xs font-medium uppercase text-[var(--color-muted-fg)]">
                    {t("portfolio.confidence")}
                  </th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-2 py-6 text-center text-xs text-[var(--color-muted-fg)]">
                      {t("portfolio.noHoldings")}
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((r) => {
                    const h = r.holding;
                    const isEditing = editingHoldingId === h.id;
                    if (isEditing) {
                      return (
                        <tr key={h.id} className="border-b border-[var(--color-border)]">
                          <td className="px-2 py-1.5">
                            <Input
                              value={holdingDraft.symbol}
                              onChange={(e) => setHoldingDraft((d) => ({ ...d, symbol: e.target.value }))}
                              list="portfolio-symbol-suggestions"
                              autoComplete="off"
                              className="h-8 w-24 uppercase"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              value={holdingDraft.quantity}
                              onChange={(e) => setHoldingDraft((d) => ({ ...d, quantity: e.target.value }))}
                              className="h-8 w-24 text-right"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              value={holdingDraft.costBasis}
                              onChange={(e) => setHoldingDraft((d) => ({ ...d, costBasis: e.target.value }))}
                              className="h-8 w-24 text-right"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              type="date"
                              value={holdingDraft.purchaseDate}
                              onChange={(e) => setHoldingDraft((d) => ({ ...d, purchaseDate: e.target.value }))}
                              className="h-8 w-36"
                            />
                          </td>
                          <td className="px-2 py-1.5" colSpan={6}>
                            <div className="flex items-center gap-1">
                              <Button size="sm" onClick={submitEditHolding} disabled={updateHolding.isPending}>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                {t("portfolio.save")}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingHoldingId(null)}>
                                <X className="mr-1 h-3.5 w-3.5" />
                                {t("portfolio.cancel")}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    const fullName = symbolNameMap.get(h.symbol.toUpperCase());
                    return (
                      <React.Fragment key={h.id}>
                      <tr
                        className="border-b border-[var(--color-border)] text-sm"
                        title={fullName ?? h.symbol}
                      >
                        <td className="px-2 py-2 font-medium">
                          {h.symbol}
                          {r.nativeCurrency && r.nativeCurrency !== currency && (
                            <span className="ml-1 text-[10px] text-[var(--color-muted-fg)]">
                              ({r.nativeCurrency})
                            </span>
                          )}
                          {r.error && (
                            <span className="ml-1 inline-block rounded bg-[var(--color-destructive)]/10 px-1 text-[10px] text-[var(--color-destructive)]">
                              !
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatQty(h.quantity)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {formatCurrency(h.costBasis, currency)}
                        </td>
                        <td className="px-2 py-2 text-xs text-[var(--color-muted-fg)]">{h.purchaseDate}</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {r.lastClose != null ? formatCurrency(r.lastClose, currency) : "—"}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {r.marketValue != null ? formatCurrency(r.marketValue, currency) : "—"}
                        </td>
                        <td
                          className={
                            "px-2 py-2 text-right tabular-nums " +
                            (r.unrealizedAbs == null
                              ? ""
                              : r.unrealizedAbs >= 0
                                ? "text-[#10b981]"
                                : "text-[#ef4444]")
                          }
                        >
                          {r.unrealizedAbs != null
                            ? `${formatCurrency(r.unrealizedAbs, currency)} (${formatPct(r.unrealizedPct)})`
                            : "—"}
                        </td>
                        <td className="px-2 py-2">
                          <AnalysisCell
                            symbol={h.symbol}
                            analysisId={h.analysisId}
                            analysisTitle={analysisTitleByHolding.get(h.id) ?? null}
                            linkLabel={t("portfolio.linkAnalysis")}
                            openLabel={t("portfolio.openAnalysis")}
                            changeLabel={t("portfolio.changeAnalysis")}
                            onOpenLinkDialog={() =>
                              setLinking({
                                holdingId: h.id,
                                symbol: h.symbol,
                                currentAnalysisId: h.analysisId,
                              })
                            }
                          />
                        </td>
                        <td className="px-2 py-2">
                          {confidenceMap.get(h.symbol.toUpperCase()) ? (
                            <ConfidenceBadge level={confidenceMap.get(h.symbol.toUpperCase())!} />
                          ) : (
                            <span className="text-xs text-[var(--color-muted-fg)]">—</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            {p.manageTransactions && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title={t("tx.transactions")}
                                onClick={() => setTxHoldingId(txHoldingId === h.id ? null : h.id)}
                                aria-label={t("tx.transactions")}
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t("portfolio.analysisInfo")}
                              disabled={!h.analysisId}
                              onClick={() => {
                                if (h.analysisId) {
                                  setInfoHolding({
                                    holdingId: h.id,
                                    symbol: h.symbol,
                                    analysisId: h.analysisId,
                                  });
                                }
                              }}
                              aria-label={t("portfolio.analysisInfo")}
                              className={h.analysisId ? "" : "opacity-30"}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                            {!p.manageTransactions && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title={t("portfolio.editHolding")}
                                onClick={() => startEditHolding(h)}
                                aria-label={t("portfolio.editHolding")}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t("portfolio.removeHolding")}
                              onClick={() => {
                                if (window.confirm(t("portfolio.confirmDeleteHolding", { symbol: h.symbol }))) {
                                  deleteHolding.mutate({ id: h.id });
                                }
                              }}
                              aria-label={t("portfolio.removeHolding")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {txHoldingId === h.id && (
                        <tr>
                          <td colSpan={10} className="border-b border-[var(--color-border)] bg-[#10b981]/5 p-0">
                            <TransactionPanel
                              holdingId={h.id}
                              symbol={h.symbol}
                              currency={currency}
                              portfolioId={portfolioId}
                              onClose={() => setTxHoldingId(null)}
                            />
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })
                )}

                <tr className="bg-[var(--color-accent)]/40">
                  <td colSpan={10} className="px-2 py-2">
                    <form onSubmit={submitAdd} className="flex flex-wrap items-end gap-2">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="new-asset-type" className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                          {t("analysis.assetType")}
                        </Label>
                        <select
                          id="new-asset-type"
                          value={assetTypeFilter}
                          onChange={(e) => setAssetTypeFilter(e.target.value as "all" | "stock" | "etf")}
                          className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
                        >
                          <option value="all">{t("analysis.assetAll")}</option>
                          <option value="stock">{t("analysis.assetStock")}</option>
                          <option value="etf">{t("analysis.assetEtf")}</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="new-symbol" className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                          {t("portfolio.symbol")}
                        </Label>
                        <Input
                          id="new-symbol"
                          value={newSymbol}
                          onChange={(e) => setNewSymbol(e.target.value)}
                          list="portfolio-symbol-suggestions"
                          autoComplete="off"
                          className="h-8 w-28 uppercase"
                          placeholder={
                            symbolsQuery.isPending
                              ? t("analysis.loadingSymbols")
                              : "AAPL"
                          }
                          maxLength={20}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="new-qty" className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                          {t("portfolio.quantity")}
                        </Label>
                        <Input
                          id="new-qty"
                          type="number"
                          step="any"
                          min="0"
                          value={newQty}
                          onChange={(e) => setNewQty(e.target.value)}
                          className="h-8 w-24"
                          placeholder="10"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="new-cost" className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                          {t("portfolio.avgCost")}
                        </Label>
                        <Input
                          id="new-cost"
                          type="number"
                          step="any"
                          min="0"
                          value={newCost}
                          onChange={(e) => setNewCost(e.target.value)}
                          className="h-8 w-28"
                          placeholder="150.00"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="new-date" className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                          {t("portfolio.purchaseDate")}
                        </Label>
                        <Input
                          id="new-date"
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="h-8 w-36"
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" disabled={addHolding.isPending}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {t("portfolio.addHolding")}
                      </Button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <datalist id="portfolio-symbol-suggestions">
        {symbolSuggestions.map((s) => (
          <option key={s.symbol} value={s.symbol}>
            {s.name} ({s.exchange}){s.assetType === "etf" ? " · ETF" : ""}
          </option>
        ))}
      </datalist>

      <PortfolioChatDrawer
        open={chatOpen}
        onOpenChange={(o) => {
          setChatOpen(o);
          if (!o) setChatInitialPrompt(null);
        }}
        initialPrompt={chatInitialPrompt}
        onInitialPromptConsumed={() => setChatInitialPrompt(null)}
        context={{
          portfolioTitle: p.title,
          currency: p.currency,
          holdings: holdings.map((h) => ({
            symbol: h.symbol,
            quantity: h.quantity,
            costBasis: h.costBasis,
            purchaseDate: h.purchaseDate,
          })),
        }}
      />

      <Dialog
        open={linking != null}
        onOpenChange={(o) => {
          if (!o) setLinking(null);
        }}
        title={
          linking
            ? t("portfolio.linkAnalysisFor", { symbol: linking.symbol })
            : t("portfolio.linkAnalysis")
        }
      >
        {linking && (
          <div className="flex flex-col gap-4">
            <div>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setGeneratingFor({ holdingId: linking.holdingId, symbol: linking.symbol });
                  setLinking(null);
                }}
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {t("portfolio.generateAnalysis")}
              </Button>
              {linking.currentAnalysisId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() =>
                    linkAnalysis.mutate({ holdingId: linking.holdingId, analysisId: null })
                  }
                  disabled={linkAnalysis.isPending}
                >
                  {t("portfolio.unlinkAnalysis")}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium uppercase text-[var(--color-muted-fg)]">
                {t("portfolio.selectAnalysis")}
              </p>
              {analysesQuery.isLoading ? (
                <p className="text-xs text-[var(--color-muted-fg)]">{t("portfolio.loading")}</p>
              ) : !analysesQuery.data || analysesQuery.data.length === 0 ? (
                <p className="text-xs text-[var(--color-muted-fg)]">{t("portfolio.noAnalyses")}</p>
              ) : (
                <ul className="flex max-h-72 flex-col divide-y divide-[var(--color-border)] overflow-y-auto rounded border border-[var(--color-border)]">
                  {analysesQuery.data.map((a) => {
                    const isCurrent = a.id === linking.currentAnalysisId;
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-2 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{a.title}</p>
                          {a.description && (
                            <p className="truncate text-xs text-[var(--color-muted-fg)]">{a.description}</p>
                          )}
                          <p className="text-[10px] text-[var(--color-muted-fg)]">
                            {t("analysis.indicatorCount", { count: a.indicatorCount })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isCurrent ? "outline" : "default"}
                          disabled={isCurrent || linkAnalysis.isPending}
                          onClick={() =>
                            linkAnalysis.mutate({
                              holdingId: linking.holdingId,
                              analysisId: a.id,
                            })
                          }
                        >
                          {isCurrent ? t("portfolio.currentLabel") : t("portfolio.linkAction")}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {generatingFor && (
        <GenerateAnalysisDialog
          open
          symbol={generatingFor.symbol}
          onClose={() => setGeneratingFor(null)}
          onLinked={async (analysisId) => {
            const holdingId = generatingFor.holdingId;
            await linkAnalysis.mutateAsync({ holdingId, analysisId });
            setGeneratingFor(null);
          }}
        />
      )}

      {infoHolding && (
        <AnalysisInfoDialog
          analysisId={infoHolding.analysisId}
          symbol={infoHolding.symbol}
          description={analysisDescByHolding.get(infoHolding.holdingId) ?? null}
          title={analysisTitleByHolding.get(infoHolding.holdingId) ?? infoHolding.symbol}
          onClose={() => setInfoHolding(null)}
          onDescriptionUpdated={() => {
            utils.portfolio.getPortfolio.invalidate({ id: portfolioId });
          }}
        />
      )}
    </div>
  );
}

function AnalysisInfoDialog({
  analysisId,
  symbol,
  description,
  title,
  onClose,
  onDescriptionUpdated,
}: {
  analysisId: string;
  symbol: string;
  description: string | null;
  title: string | null;
  onClose: () => void;
  onDescriptionUpdated: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [localDesc, setLocalDesc] = useState(description ?? "");
  const [busy, setBusy] = useState(false);
  const utils = trpc.useUtils();

  const analysisQuery = trpc.analysis.getAnalysis.useQuery({ id: analysisId });

  const summarizeMutation = trpc.ai.summarizeChart.useMutation({
    onError: () => toast.error(t("portfolio.summaryFailed")),
  });

  const updateMutation = trpc.analysis.updateAnalysis.useMutation({
    onSuccess: () => {
      utils.analysis.getAnalysis.invalidate({ id: analysisId });
      onDescriptionUpdated();
      toast.success(t("portfolio.summaryUpdated"));
    },
    onError: (err) => toast.error(err.message),
  });

  async function handleSummarize() {
    const data = analysisQuery.data;
    if (!data) return;
    setBusy(true);
    try {
      const result = await summarizeMutation.mutateAsync({
        symbol: data.symbol || symbol,
        range: "1y",
        interval: "1d",
        indicators: data.indicators.map((ind) => ind.spec),
        language: i18n.language,
      });
      setLocalDesc(result.summary);
      await updateMutation.mutateAsync({ id: analysisId, description: result.summary });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(o) => { if (!o) onClose(); }}
      title={title ?? t("portfolio.analysisInfo")}
    >
      <div className="flex flex-col gap-3">
        <div className="min-h-[60px] text-[var(--color-fg)]">
          {localDesc ? (
            <Markdown>{localDesc}</Markdown>
          ) : (
            <span className="italic text-[var(--color-muted-fg)]">
              {t("portfolio.noDescription")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
          <Button
            size="sm"
            onClick={handleSummarize}
            disabled={busy || analysisQuery.isLoading}
          >
            {busy ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-3.5 w-3.5" />
            )}
            {t("portfolio.updateSummary")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function AnalysisCell({
  symbol,
  analysisId,
  analysisTitle,
  linkLabel,
  openLabel,
  changeLabel,
  onOpenLinkDialog,
}: {
  symbol: string;
  analysisId: string | null;
  analysisTitle: string | null;
  linkLabel: string;
  openLabel: string;
  changeLabel: string;
  onOpenLinkDialog: () => void;
}) {
  if (!analysisId) {
    return (
      <Button size="sm" variant="outline" onClick={onOpenLinkDialog}>
        <Sparkles className="mr-1 h-3.5 w-3.5" />
        {linkLabel}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Link
        to="/dashboard/analysis"
        search={{ analysisId, symbol }}
        className="inline-flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-accent)]/50 p-1.5 hover:bg-[var(--color-accent)]"
        title={analysisTitle ?? openLabel}
      >
        <LineChart className="h-3.5 w-3.5" />
      </Link>
      <Button
        size="sm"
        variant="ghost"
        title={changeLabel}
        onClick={onOpenLinkDialog}
        aria-label={changeLabel}
      >
        <Replace className="h-3 w-3" />
      </Button>
    </div>
  );
}

function TotalTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "neutral";
}) {
  const color =
    tone === "pos" ? "text-[#10b981]" : tone === "neg" ? "text-[#ef4444]" : "text-[var(--color-fg)]";
  return (
    <div>
      <p className="text-xs text-[var(--color-muted-fg)]">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Th({
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
    <th className={`px-2 py-2 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={onClick}
        className={
          "flex items-center gap-1 text-xs font-medium uppercase " +
          (active ? "text-[var(--color-fg)]" : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]") +
          (align === "right" ? " ml-auto" : "")
        }
      >
        {children}
        {active && <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

const DIVIDEND_COLLAPSED_KEY = "finatalk:dividend-collapsed";

function loadDividendCollapsed(): boolean {
  try {
    return window.localStorage.getItem(DIVIDEND_COLLAPSED_KEY) !== "false";
  } catch {
    return true;
  }
}

function saveDividendCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(DIVIDEND_COLLAPSED_KEY, String(collapsed));
  } catch { /* ignore */ }
}

function TransactionPanel({
  holdingId,
  symbol,
  currency,
  portfolioId,
  onClose,
}: {
  holdingId: string;
  symbol: string;
  currency: string;
  portfolioId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const txQuery = trpc.portfolio.listTransactions.useQuery({ holdingId });
  const addTx = trpc.portfolio.addTransaction.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.portfolio.listTransactions.invalidate({ holdingId }),
        utils.portfolio.getPortfolio.invalidate({ id: portfolioId }),
        utils.portfolio.getValuation.invalidate({ id: portfolioId }),
        utils.portfolio.getPortfolioTaxSummary.invalidate({ id: portfolioId }),
      ]);
      setType("buy");
      setQty("");
      setPrice("");
      setFee("");
      setDate(todayIso());
      setNote("");
      toast.success(t("tx.added"));
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteTx = trpc.portfolio.deleteTransaction.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.portfolio.listTransactions.invalidate({ holdingId }),
        utils.portfolio.getPortfolio.invalidate({ id: portfolioId }),
        utils.portfolio.getValuation.invalidate({ id: portfolioId }),
        utils.portfolio.getPortfolioTaxSummary.invalidate({ id: portfolioId }),
      ]);
      toast.success(t("tx.deleted"));
    },
    onError: (e) => toast.error(e.message),
  });

  const [type, setType] = useState<"buy" | "sell" | "dividend">("buy");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number(qty);
    const p = Number(price);
    const f = Number(fee) || 0;
    if (!Number.isFinite(q) || q <= 0 || !Number.isFinite(p) || p < 0) return;
    addTx.mutate({
      holdingId,
      transaction: { type, quantity: q, price: p, fee: f, date, note: note.trim() || undefined },
    });
  }

  const data = txQuery.data;

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-[var(--color-muted-fg)]" />
        <span className="text-xs font-semibold uppercase text-[var(--color-muted-fg)]">
          {t("tx.transactionsFor", { symbol })}
        </span>
        {data && (
          <span className="ml-auto text-xs text-[var(--color-muted-fg)]">
            {t("tx.acb")}: {formatCurrency(data.acbPerShare, currency)}/sh
            {data.realizedGains !== 0 && (
              <> · {t("tx.realizedPl")}: <span className={data.realizedGains >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}>{formatCurrency(data.realizedGains, currency)}</span></>
            )}
          </span>
        )}
      </div>

      {txQuery.isPending ? (
        <div className="flex items-center gap-2 py-2 text-xs text-[var(--color-muted-fg)]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("portfolio.loading")}
        </div>
      ) : data && data.transactions.length > 0 ? (
        <table className="mb-3 w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-fg)]">
              <th className="px-1 py-1 font-medium">{t("tx.date")}</th>
              <th className="px-1 py-1 font-medium">{t("tx.type")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.qty")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.price")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.fee")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.realizedGain")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.acbAfter")}</th>
              <th className="px-1 py-1 text-right font-medium">{t("tx.sharesAfter")}</th>
              <th className="px-1 py-1" />
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-[var(--color-border)]">
                <td className="px-1 py-1 text-[var(--color-muted-fg)]">{tx.date}</td>
                <td className="px-1 py-1">
                  <span
                    className={
                      "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase " +
                      (tx.type === "buy"
                        ? "bg-[#10b981]/10 text-[#10b981]"
                        : tx.type === "sell"
                          ? "bg-[#ef4444]/10 text-[#ef4444]"
                          : "bg-[#3b82f6]/10 text-[#3b82f6]")
                    }
                  >
                    {t(`tx.${tx.type}`)}
                  </span>
                </td>
                <td className="px-1 py-1 text-right tabular-nums">{formatQty(tx.quantity)}</td>
                <td className="px-1 py-1 text-right tabular-nums">{formatCurrency(tx.price, currency)}</td>
                <td className="px-1 py-1 text-right tabular-nums text-[var(--color-muted-fg)]">
                  {tx.fee > 0 ? formatCurrency(tx.fee, currency) : "—"}
                </td>
                <td
                  className={
                    "px-1 py-1 text-right tabular-nums " +
                    (tx.realizedGain == null ? "" : tx.realizedGain >= 0 ? "text-[#10b981]" : "text-[#ef4444]")
                  }
                >
                  {tx.realizedGain != null ? formatCurrency(tx.realizedGain, currency) : "—"}
                </td>
                <td className="px-1 py-1 text-right tabular-nums">{formatCurrency(tx.acbPerShareAfter, currency)}</td>
                <td className="px-1 py-1 text-right tabular-nums">{formatQty(tx.sharesAfter)}</td>
                <td className="px-1 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t("tx.confirmDelete"))) {
                        deleteTx.mutate({ id: tx.id });
                      }
                    }}
                    className="rounded p-1 text-[var(--color-muted-fg)] hover:text-[var(--color-destructive)]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mb-3 text-xs text-[var(--color-muted-fg)]">{t("tx.noTransactions")}</p>
      )}

      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.type")}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "buy" | "sell" | "dividend")}
            className="h-7 rounded border border-[var(--color-border)] bg-transparent px-1.5 text-xs"
          >
            <option value="buy">{t("tx.buy")}</option>
            <option value="sell">{t("tx.sell")}</option>
            <option value="dividend">{t("tx.dividend")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.qty")}</label>
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" step="any" min="0" className="h-7 w-20 text-xs" required />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.price")}</label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="any" min="0" className="h-7 w-24 text-xs" required />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.fee")}</label>
          <Input value={fee} onChange={(e) => setFee(e.target.value)} type="number" step="any" min="0" className="h-7 w-20 text-xs" placeholder="0" />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.date")}</label>
          <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="h-7 w-32 text-xs" required />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("tx.note")}</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-7 w-32 text-xs" maxLength={500} />
        </div>
        <Button type="submit" size="sm" disabled={addTx.isPending} className="h-7 text-xs">
          {addTx.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Plus className="mr-1 h-3 w-3" />}
          {t("tx.add")}
        </Button>
      </form>
      <div className="mt-3 flex justify-end">
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onClose}>
          <X className="mr-1 h-3 w-3" />
          {t("tx.close")}
        </Button>
      </div>
    </div>
  );
}

function TaxSummarySection({
  portfolioId,
  currency,
}: {
  portfolioId: string;
  currency: string;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);

  const taxQuery = trpc.portfolio.getPortfolioTaxSummary.useQuery(
    { id: portfolioId },
    { enabled: !collapsed, staleTime: 60_000 },
  );

  const data = taxQuery.data;
  const items = data?.items ?? [];
  const hasData = items.length > 0;

  if (collapsed && !hasData) {
    return (
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed(false)}>
          <div className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
            <CardTitle className="text-sm font-semibold">{t("tx.taxSummary")}</CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setCollapsed((v) => !v)}>
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          )}
          <CardTitle className="text-sm font-semibold">{t("tx.taxSummary")}</CardTitle>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          {taxQuery.isPending ? (
            <div className="flex items-center gap-2 py-4 text-xs text-[var(--color-muted-fg)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("portfolio.loading")}
            </div>
          ) : items.length === 0 ? (
            <p className="text-xs text-[var(--color-muted-fg)]">{t("tx.noTransactions")}</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-[var(--color-muted-fg)]">{t("tx.totalRealized")}</p>
                  <p className={`text-lg font-semibold tabular-nums ${data!.totalRealized >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                    {formatCurrency(data!.totalRealized, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-fg)]">{t("tx.taxableGains")}</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(data!.taxableGains, currency)}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted-fg)]">{t("tx.taxNote")}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
                      <th className="px-2 py-2 font-medium">{t("portfolio.symbol")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("tx.shares")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("tx.acbPerShare")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("tx.acbTotal")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("tx.realizedPl")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("tx.txCount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.sort((a, b) => a.symbol.localeCompare(b.symbol)).map((r) => (
                      <tr key={r.holdingId} className="border-b border-[var(--color-border)]">
                        <td className="px-2 py-2 font-medium">{r.symbol}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatQty(r.totalShares)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(r.acbPerShare, currency)}</td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(r.acbTotal, currency)}</td>
                        <td className={`px-2 py-2 text-right tabular-nums ${r.realizedGains >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                          {formatCurrency(r.realizedGains, currency)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{r.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function DividendSection({
  symbols,
  holdings,
  currency,
}: {
  symbols: string[];
  holdings: Array<{ symbol: string; quantity: number }>;
  currency: string;
}) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(loadDividendCollapsed);

  function toggle() {
    setCollapsed((v) => {
      saveDividendCollapsed(!v);
      return !v;
    });
  }

  const dividendQuery = trpc.market.getDividendInfo.useQuery(
    { symbols },
    { enabled: symbols.length > 0 && !collapsed, staleTime: 300_000, retry: false },
  );

  const data = dividendQuery.data ?? [];
  const sortedData = [...data].sort((a, b) => a.symbol.localeCompare(b.symbol));
  const withDividends = sortedData.filter((d) => d.dividendRate != null && d.dividendRate > 0);

  if (symbols.length === 0) return null;

  const qtyBySymbol = new Map<string, number>();
  for (const h of holdings) {
    const sym = h.symbol.toUpperCase();
    qtyBySymbol.set(sym, (qtyBySymbol.get(sym) ?? 0) + h.quantity);
  }

  const totalAnnual = withDividends.reduce((sum, d) => {
    const qty = qtyBySymbol.get(d.symbol) ?? 0;
    return sum + qty * (d.dividendRate ?? 0);
  }, 0);

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={toggle}>
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-[var(--color-muted-fg)]" aria-hidden />
          )}
          <CardTitle className="text-sm font-semibold">{t("dividend.title")}</CardTitle>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          {dividendQuery.isPending ? (
            <div className="flex items-center gap-2 py-4 text-xs text-[var(--color-muted-fg)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("portfolio.loading")}
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-[var(--color-muted-fg)]">{t("dividend.annualIncome")}</p>
                  <p className="text-lg font-semibold tabular-nums text-[#10b981]">
                    {formatCurrency(totalAnnual, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted-fg)]">{t("dividend.monthlyEstimate")}</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(totalAnnual / 12, currency)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
                      <th className="px-2 py-2 font-medium">{t("portfolio.symbol")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("dividend.yield")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("dividend.rate")}</th>
                      <th className="px-2 py-2 font-medium">{t("dividend.exDate")}</th>
                      <th className="px-2 py-2 font-medium">{t("dividend.payDate")}</th>
                      <th className="px-2 py-2 text-right font-medium">{t("dividend.annualEst")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((d) => {
                      const pays = d.dividendRate != null && d.dividendRate > 0;
                      const qty = qtyBySymbol.get(d.symbol) ?? 0;
                      const annual = pays ? qty * (d.dividendRate ?? 0) : 0;
                      return (
                        <tr key={d.symbol} className="border-b border-[var(--color-border)]">
                          <td className="px-2 py-2 font-medium">{d.symbol}</td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {pays && d.dividendYield != null ? `${(d.dividendYield * 100).toFixed(2)}%` : "—"}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums">
                            {pays && d.dividendRate != null ? `$${d.dividendRate.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-2 py-2 text-xs text-[var(--color-muted-fg)]">
                            {pays ? (d.exDividendDate ?? "—") : "—"}
                          </td>
                          <td className="px-2 py-2 text-xs text-[var(--color-muted-fg)]">
                            {pays ? (d.dividendDate ?? "—") : "—"}
                          </td>
                          <td className={`px-2 py-2 text-right tabular-nums font-medium ${pays ? "text-[#10b981]" : ""}`}>
                            {pays ? formatCurrency(annual, currency) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
