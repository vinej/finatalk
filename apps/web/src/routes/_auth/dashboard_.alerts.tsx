import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, ChevronDown, ChevronRight, Plus, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertsList, type AlertListItem } from "@/components/alerts/alerts-list";
import { StrategySelect } from "@/components/strategy-select";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { pickLang } from "@/lib/lang";
import { STRATEGY_GUIDE, STRATEGY_KINDS, type StrategyKind } from "@/lib/strategy-guide";
import { STRATEGY_ALERT_TEMPLATES, type AlertTemplate } from "@/lib/strategy-alerts";
import { SYMBOL_RE } from "@/lib/symbol";
import { cn } from "@/lib/utils";
import { ALERT_CONDITIONS, paramShape, thresholdKind, type AlertConditionType, type AlertIndicatorParams } from "@finatalk/trpc/constants/alerts";
import { trpc } from "@/lib/trpc";

type AlertsSearch = { symbol?: string };
type AlertSource = "manual" | "strategy_symbol" | "strategy_portfolio";
type AssetTypeKey = "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";

export const Route = createFileRoute("/_auth/dashboard_/alerts")({
  component: AlertsPage,
  validateSearch: (raw: Record<string, unknown>): AlertsSearch => ({
    symbol: typeof raw.symbol === "string" ? raw.symbol : undefined,
  }),
});

type Tab = "manual" | "strategy" | "portfolio";

function formatParams(params: AlertIndicatorParams | null | undefined): string {
  if (!params) return "";
  const parts: string[] = [];
  if (params.fast != null) parts.push(`fast=${params.fast}`);
  if (params.slow != null) parts.push(`slow=${params.slow}`);
  if (params.signal != null) parts.push(`signal=${params.signal}`);
  if (params.period != null) parts.push(`period=${params.period}`);
  if (params.stdDev != null) parts.push(`σ=${params.stdDev}`);
  if (params.lookback != null) parts.push(`lookback=${params.lookback}`);
  return parts.join(", ");
}

function formatThresholdValue(ct: AlertConditionType, v: number): string {
  const kind = thresholdKind(ct);
  if (kind === "none") return "";
  const n = v.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (kind === "pct") return `${n}%`;
  if (kind === "multiplier") return `${n}×`;
  return n;
}

function AlertsPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const utils = trpc.useUtils();
  const search = Route.useSearch();

  const alertsQuery = trpc.alert.list.useQuery();
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const assetTypeMap = useMemo<Map<string, AssetTypeKey>>(() => {
    const m = new Map<string, AssetTypeKey>();
    for (const s of symbolsQuery.data?.symbols ?? []) {
      m.set(s.symbol.toUpperCase(), s.assetType as AssetTypeKey);
    }
    return m;
  }, [symbolsQuery.data]);

  const portfolioTitleMap = useMemo<Map<string, string>>(() => {
    const m = new Map<string, string>();
    for (const p of portfoliosQuery.data ?? []) m.set(p.id, p.title);
    return m;
  }, [portfoliosQuery.data]);

  const [tab, setTab] = useState<Tab>("manual");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{t("alerts.title")}</h1>
        <p className="mt-1 text-xs text-[var(--color-muted-fg)]">{t("alerts.subtitle")}</p>
      </div>

      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(["manual", "strategy", "portfolio"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium border-b-2 -mb-px",
              tab === k
                ? "border-[var(--color-primary)] text-[var(--color-fg)]"
                : "border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]",
            )}
          >
            {t(`alerts.tab.${k}`)}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <ManualTab initialSymbol={search.symbol ?? ""} utils={utils} assetTypeMap={assetTypeMap} />
      )}
      {tab === "strategy" && <StrategyTab initialSymbol={search.symbol ?? ""} utils={utils} lang={lang} assetTypeMap={assetTypeMap} />}
      {tab === "portfolio" && (
        <PortfolioTab portfolios={portfoliosQuery.data ?? []} utils={utils} lang={lang} />
      )}

      <AlertsList
        alerts={alertsQuery.data ?? []}
        lang={lang}
        portfolioTitleMap={portfolioTitleMap}
      />
    </div>
  );
}

// ─── Manual tab ──────────────────────────────────────────────────────────────

function ManualTab({
  initialSymbol,
  utils,
  assetTypeMap,
}: {
  initialSymbol: string;
  utils: ReturnType<typeof trpc.useUtils>;
  assetTypeMap: Map<string, AssetTypeKey>;
}) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState<string>(initialSymbol.toUpperCase());
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [exchangeFilter, setExchangeFilter] = useState<string>("all");
  const [conditionType, setConditionType] = useState<AlertConditionType>("price_above");
  const [threshold, setThreshold] = useState<string>("");
  const [fast, setFast] = useState<string>("50");
  const [slow, setSlow] = useState<string>("200");
  const [signal, setSignal] = useState<string>("9");
  const [period, setPeriod] = useState<string>("14");
  const [stdDev, setStdDev] = useState<string>("2");
  const [lookback, setLookback] = useState<string>("20");

  useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol.toUpperCase());
  }, [initialSymbol]);

  const create = trpc.alert.create.useMutation({
    onSuccess: () => {
      void utils.alert.list.invalidate();
      setThreshold("");
      toast.success(t("alerts.created"));
    },
    onError: (e) => toast.error(e.message),
  });

  const kind = thresholdKind(conditionType);
  const shape = paramShape(conditionType);

  const queryParams = useMemo<AlertIndicatorParams | null>(() => {
    const p: AlertIndicatorParams = {};
    if (shape.fast) p.fast = Number(fast);
    if (shape.slow) p.slow = Number(slow);
    if (shape.signal) p.signal = Number(signal);
    if (shape.period) p.period = Number(period);
    if (shape.stdDev) p.stdDev = Number(stdDev);
    if (shape.lookback) p.lookback = Number(lookback);
    return Object.keys(p).length > 0 ? p : null;
  }, [shape, fast, slow, signal, period, stdDev, lookback]);

  const trimmedSymbol = symbol.trim().toUpperCase();
  const symbolValid = trimmedSymbol.length > 0 && SYMBOL_RE.test(trimmedSymbol);

  const currentValueQuery = trpc.alert.currentValue.useQuery(
    {
      symbol: trimmedSymbol,
      conditionType,
      indicatorParams: queryParams,
    },
    {
      enabled: symbolValid && kind !== "none",
      staleTime: 60_000,
      retry: false,
    },
  );

  useEffect(() => {
    if (kind === "none") return;
    const v = currentValueQuery.data?.value;
    if (v == null || !Number.isFinite(v)) return;
    const decimals = kind === "price" ? 4 : 2;
    setThreshold(v.toFixed(decimals).replace(/\.?0+$/, ""));
  }, [currentValueQuery.data?.value, kind]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym || !SYMBOL_RE.test(sym)) {
      toast.error(t("analysis.pickFromList"));
      return;
    }
    const kind = thresholdKind(conditionType);
    let thr = 0;
    if (kind !== "none") {
      const n = Number(threshold);
      if (!Number.isFinite(n) || n < 0) {
        toast.error(t("alerts.invalidThreshold"));
        return;
      }
      thr = n;
    }
    const shape = paramShape(conditionType);
    const params: AlertIndicatorParams = {};
    if (shape.fast) params.fast = Number(fast);
    if (shape.slow) params.slow = Number(slow);
    if (shape.signal) params.signal = Number(signal);
    if (shape.period) params.period = Number(period);
    if (shape.stdDev) params.stdDev = Number(stdDev);
    if (shape.lookback) params.lookback = Number(lookback);
    const assetType =
      assetTypeMap.get(sym) ?? (assetTypeFilter !== "all" ? (assetTypeFilter as AssetTypeKey) : null);
    create.mutate({
      symbol: sym,
      conditionType,
      threshold: thr,
      indicatorParams: Object.keys(params).length > 0 ? params : null,
      source: "manual",
      assetType,
      strategyKind: null,
      portfolioId: null,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t("alerts.newAlert")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <SymbolPicker
            inputId="alert-symbol"
            listId="alert-symbol-suggestions"
            value={symbol}
            onChange={setSymbol}
            maxLength={20}
            inputClassName="h-8 w-36 uppercase"
            assetTypeFilter={assetTypeFilter}
            onAssetTypeChange={setAssetTypeFilter}
            exchangeFilter={exchangeFilter}
            onExchangeChange={setExchangeFilter}
          />
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.condition")}</Label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value as AlertConditionType)}
              className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            >
              {ALERT_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {t(`alerts.conditionType.${c}`)}
                </option>
              ))}
            </select>
          </div>
          {kind !== "none" && (
            <div className="relative flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.threshold")}</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="h-8 w-28"
                required
              />
              <span className="pointer-events-none absolute top-full left-0 mt-0.5 text-[10px] text-[var(--color-muted-fg)] whitespace-nowrap">
                {t(`alerts.thresholdHint.${kind}`)}
              </span>
            </div>
          )}
          {shape.fast && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.fast")}</Label>
              <Input type="number" min="2" max="500" value={fast} onChange={(e) => setFast(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          {shape.slow && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.slow")}</Label>
              <Input type="number" min="2" max="500" value={slow} onChange={(e) => setSlow(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          {shape.signal && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.signalParam")}</Label>
              <Input type="number" min="2" max="500" value={signal} onChange={(e) => setSignal(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          {shape.period && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.period")}</Label>
              <Input type="number" min="2" max="500" value={period} onChange={(e) => setPeriod(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          {shape.stdDev && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.stdDev")}</Label>
              <Input type="number" min="0.1" max="10" step="0.1" value={stdDev} onChange={(e) => setStdDev(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          {shape.lookback && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.lookback")}</Label>
              <Input type="number" min="2" max="1000" value={lookback} onChange={(e) => setLookback(e.target.value)} className="h-8 w-20" />
            </div>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={create.isPending || !symbol.trim()}
            variant="primary"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t("alerts.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Strategy tab ────────────────────────────────────────────────────────────

function StrategyTab({
  initialSymbol,
  utils,
  lang,
  assetTypeMap,
}: {
  initialSymbol: string;
  utils: ReturnType<typeof trpc.useUtils>;
  lang: "en" | "fr";
  assetTypeMap: Map<string, AssetTypeKey>;
}) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState<string>(initialSymbol.toUpperCase());
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [exchangeFilter, setExchangeFilter] = useState<string>("all");
  const [strategyKind, setStrategyKind] = useState<StrategyKind>("trendPullback");
  const [thresholdsOverride, setThresholdsOverride] = useState<Record<number, string>>({});

  useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol.toUpperCase());
  }, [initialSymbol]);

  useEffect(() => {
    setThresholdsOverride({});
  }, [strategyKind]);

  const templates = STRATEGY_ALERT_TEMPLATES[strategyKind];

  const createBulk = trpc.alert.createBulk.useMutation({
    onSuccess: (data) => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.generated", { count: data.count }));
    },
    onError: (e) => toast.error(e.message),
  });

  function generate() {
    const sym = symbol.trim().toUpperCase();
    if (!sym || !SYMBOL_RE.test(sym)) {
      toast.error(t("analysis.pickFromList"));
      return;
    }
    if (templates.length === 0) return;
    const assetType = assetTypeMap.get(sym) ?? null;
    const alerts = templates.map((tpl, idx) => ({
      symbol: sym,
      conditionType: tpl.conditionType,
      threshold: Number(thresholdsOverride[idx] ?? tpl.threshold),
      indicatorParams: tpl.indicatorParams,
      source: "strategy_symbol" as const,
      assetType,
      strategyKind,
      portfolioId: null,
    }));
    createBulk.mutate({ alerts });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t("alerts.fromStrategy.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.fromStrategy.strategy")}</Label>
            <StrategySelect
              strategies={STRATEGY_KINDS}
              grouped
              lang={lang}
              value={strategyKind}
              onChange={(v) => { if (v) setStrategyKind(v as StrategyKind); }}
              suffixFor={(k) => (STRATEGY_ALERT_TEMPLATES[k].length > 0 ? null : t("alerts.unsupportedSuffix"))}
              className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            />
          </div>
          <SymbolPicker
            inputId="strategy-alert-symbol"
            listId="strategy-alert-symbol-suggestions"
            value={symbol}
            onChange={setSymbol}
            maxLength={20}
            inputClassName="h-8 w-36 uppercase"
            assetTypeFilter={assetTypeFilter}
            onAssetTypeChange={setAssetTypeFilter}
            exchangeFilter={exchangeFilter}
            onExchangeChange={setExchangeFilter}
          />
        </div>

        <TemplatePreview
          templates={templates}
          thresholdsOverride={thresholdsOverride}
          setThresholdsOverride={setThresholdsOverride}
        />

        <div>
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={createBulk.isPending || templates.length === 0 || !symbol.trim()}
            variant="primary"
          >
            <Wand2 className="mr-1 h-3.5 w-3.5" />
            {t("alerts.fromStrategy.generate", { count: templates.length })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplatePreview({
  templates,
  thresholdsOverride,
  setThresholdsOverride,
}: {
  templates: AlertTemplate[];
  thresholdsOverride: Record<number, string>;
  setThresholdsOverride: (v: Record<number, string>) => void;
}) {
  const { t } = useTranslation();
  if (templates.length === 0) {
    return (
      <p className="rounded border border-dashed border-[var(--color-border)] px-3 py-3 text-xs text-[var(--color-muted-fg)]">
        {t("alerts.unsupportedStrategy")}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase text-[var(--color-muted-fg)]">{t("alerts.fromStrategy.preview")}</p>
      <div className="space-y-1.5">
        {templates.map((tpl, idx) => {
          const kind = thresholdKind(tpl.conditionType);
          const paramsText = formatParams(tpl.indicatorParams);
          return (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <span className="font-medium">{t(`alerts.conditionType.${tpl.conditionType}`)}</span>
              {paramsText && <span className="text-xs text-[var(--color-muted-fg)]">{paramsText}</span>}
              {kind !== "none" && (
                <div className="ml-auto flex items-center gap-1">
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={thresholdsOverride[idx] ?? String(tpl.threshold)}
                    onChange={(e) =>
                      setThresholdsOverride({ ...thresholdsOverride, [idx]: e.target.value })
                    }
                    className="h-7 w-20"
                  />
                  <span className="text-[10px] text-[var(--color-muted-fg)]">
                    {kind === "pct" ? "%" : kind === "multiplier" ? "×" : kind === "rsi" ? "RSI" : kind === "adx" ? "ADX" : ""}
                  </span>
                </div>
              )}
              <span className="w-full text-[10px] text-[var(--color-muted-fg)]">
                {t(`alerts.rationale.${tpl.rationaleKey}`, { defaultValue: "" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Portfolio tab ───────────────────────────────────────────────────────────

type PortfolioSummary = {
  id: string;
  title: string;
  strategyKind: string | null;
  holdingCount: number;
};

function PortfolioTab({
  portfolios,
  utils,
  lang,
}: {
  portfolios: PortfolioSummary[];
  utils: ReturnType<typeof trpc.useUtils>;
  lang: "en" | "fr";
}) {
  const { t } = useTranslation();
  const [portfolioId, setPortfolioId] = useState<string>("");
  const [overrideStrategy, setOverrideStrategy] = useState<StrategyKind | "">("");

  useEffect(() => {
    if (!portfolioId && portfolios.length > 0) setPortfolioId(portfolios[0]!.id);
  }, [portfolios, portfolioId]);

  const selected = portfolios.find((p) => p.id === portfolioId);
  const detailQuery = trpc.portfolio.getPortfolio.useQuery(
    { id: portfolioId },
    { enabled: Boolean(portfolioId) },
  );
  const detail = detailQuery.data;

  const portfolioStrategy = selected?.strategyKind as StrategyKind | null | undefined;
  const effectiveStrategy: StrategyKind | null = (overrideStrategy || portfolioStrategy || null) as StrategyKind | null;
  const templates = effectiveStrategy ? STRATEGY_ALERT_TEMPLATES[effectiveStrategy] : [];

  const createBulk = trpc.alert.createBulk.useMutation({
    onSuccess: (data) => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.generated", { count: data.count }));
    },
    onError: (e) => toast.error(e.message),
  });

  function generate() {
    if (!effectiveStrategy) return;
    if (!detail) return;
    if (templates.length === 0) return;
    const holdings = detail.holdings;
    if (holdings.length === 0) {
      toast.error(t("alerts.fromPortfolio.noHoldings"));
      return;
    }
    const alerts = holdings.flatMap((h) =>
      templates.map((tpl) => ({
        symbol: h.symbol.toUpperCase(),
        conditionType: tpl.conditionType,
        threshold: tpl.threshold,
        indicatorParams: tpl.indicatorParams,
        source: "strategy_portfolio" as const,
        assetType: (h.assetType ?? null) as AssetTypeKey | null,
        strategyKind: effectiveStrategy,
        portfolioId: detail.id,
      })),
    );
    if (alerts.length > 100) {
      toast.error(t("alerts.fromPortfolio.tooMany", { max: 100 }));
      return;
    }
    createBulk.mutate({ alerts });
  }

  const totalAlerts = (detail?.holdings.length ?? 0) * templates.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{t("alerts.fromPortfolio.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("alerts.fromPortfolio.portfolio")}</Label>
            <select
              value={portfolioId}
              onChange={(e) => setPortfolioId(e.target.value)}
              className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            >
              {portfolios.length === 0 && <option value="">{t("alerts.fromPortfolio.noPortfolios")}</option>}
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.holdingCount})
                </option>
              ))}
            </select>
          </div>
          {selected && (
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">
                {portfolioStrategy ? t("alerts.fromPortfolio.linkedStrategy") : t("alerts.fromPortfolio.chooseStrategy")}
              </Label>
              <StrategySelect
                strategies={STRATEGY_KINDS}
                grouped
                lang={lang}
                value={overrideStrategy || portfolioStrategy || ""}
                onChange={(v) => setOverrideStrategy(v as StrategyKind)}
                placeholder={!portfolioStrategy ? t("alerts.fromPortfolio.selectStrategyPrompt") : undefined}
                suffixFor={(k) => (STRATEGY_ALERT_TEMPLATES[k].length > 0 ? null : t("alerts.unsupportedSuffix"))}
                className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              />
            </div>
          )}
        </div>

        {detail && (
          <div className="text-xs text-[var(--color-muted-fg)]">
            {t("alerts.fromPortfolio.summary", {
              holdings: detail.holdings.length,
              perSymbol: templates.length,
              total: totalAlerts,
            })}
          </div>
        )}

        <TemplatePreview
          templates={templates}
          thresholdsOverride={{}}
          setThresholdsOverride={() => {
            /* portfolio tab uses default thresholds */
          }}
        />

        <div>
          <Button
            type="button"
            size="sm"
            onClick={generate}
            disabled={
              createBulk.isPending ||
              !effectiveStrategy ||
              templates.length === 0 ||
              !detail ||
              detail.holdings.length === 0
            }
            variant="primary"
          >
            <Wand2 className="mr-1 h-3.5 w-3.5" />
            {t("alerts.fromPortfolio.generate", { count: totalAlerts })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

