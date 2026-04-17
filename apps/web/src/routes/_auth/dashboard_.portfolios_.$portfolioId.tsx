import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, LineChart, Loader2, MessageSquare, Pencil, Plus, Replace, Sparkles, Trash2, X, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AllocationDonut, colorFor, type DonutSegment } from "@/components/portfolio/allocation-donut";
import { GenerateAnalysisDialog } from "@/components/portfolio/generate-analysis-dialog";
import { PortfolioChatDrawer } from "@/components/portfolio/portfolio-chat-drawer";
import { PortfolioPerformanceChart } from "@/components/portfolio/portfolio-performance-chart";
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
  const { t } = useTranslation();
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
  const [sortKey, setSortKey] = useState<SortKey>("marketValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [chatOpen, setChatOpen] = useState(false);
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

  const rows = valuationQuery.data?.rows ?? [];
  const holdings = portfolioQuery.data?.holdings ?? [];
  const currency = portfolioQuery.data?.currency ?? "USD";
  const totals = valuationQuery.data?.totals;

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
    <div className="mx-auto max-w-6xl">
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
          <Button type="button" size="sm" variant="outline" onClick={() => setChatOpen(true)}>
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
              <PortfolioPerformanceChart items={performanceItems} currency={currency} />
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

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t("portfolio.holdings")}</CardTitle>
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
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-2 py-6 text-center text-xs text-[var(--color-muted-fg)]">
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
                          <td className="px-2 py-1.5" colSpan={5}>
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
                      <tr
                        key={h.id}
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
                        <td className="px-2 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            {h.analysisId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title={t("portfolio.analysisInfo")}
                                onClick={() =>
                                  setInfoHolding({
                                    holdingId: h.id,
                                    symbol: h.symbol,
                                    analysisId: h.analysisId!,
                                  })
                                }
                                aria-label={t("portfolio.analysisInfo")}
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t("portfolio.editHolding")}
                              onClick={() => startEditHolding(h)}
                              aria-label={t("portfolio.editHolding")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
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
                    );
                  })
                )}

                <tr className="bg-[var(--color-accent)]/40">
                  <td colSpan={9} className="px-2 py-2">
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
        onOpenChange={setChatOpen}
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
        <div className="min-h-[60px] whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-fg)]">
          {localDesc || (
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
        className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-accent)]/50 px-2 py-1 text-xs font-medium hover:bg-[var(--color-accent)]"
        title={openLabel}
      >
        <LineChart className="h-3 w-3" />
        <span className="max-w-[160px] truncate">{analysisTitle ?? analysisId}</span>
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
