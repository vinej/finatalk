import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, ChevronDown, ChevronRight, Plus, Trash2, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { pickLang } from "@/lib/lang";
import { STRATEGY_GROUPS, STRATEGY_GROUP_ORDER, STRATEGY_GUIDE, type StrategyKind } from "@/lib/strategy-guide";
import { STRATEGY_ALERT_TEMPLATES, type AlertTemplate } from "@/lib/strategy-alerts";
import { cn } from "@/lib/utils";
import { ALERT_CONDITIONS, paramShape, thresholdKind, type AlertConditionType, type AlertIndicatorParams } from "@finatalk/trpc/constants/alerts";
import { trpc } from "@/lib/trpc";

const SYMBOL_RE = /^[A-Z0-9.\-=^]+$/;

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

  const kind = thresholdKind(conditionType);
  const shape = paramShape(conditionType);

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
            placeholder="AAPL"
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
            <div className="flex flex-col gap-1">
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
              <span className="text-[10px] text-[var(--color-muted-fg)]">{t(`alerts.thresholdHint.${kind}`)}</span>
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
          <Button type="submit" size="sm" disabled={create.isPending || !symbol.trim()}>
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
            <select
              value={strategyKind}
              onChange={(e) => setStrategyKind(e.target.value as StrategyKind)}
              className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            >
              {STRATEGY_GROUP_ORDER.map((group) => (
                <optgroup key={group} label={t(`learnStrategies.group.${group}`)}>
                  {STRATEGY_GROUPS[group].map((k) => {
                    const supported = STRATEGY_ALERT_TEMPLATES[k].length > 0;
                    const label = STRATEGY_GUIDE[lang][k].label;
                    return (
                      <option key={k} value={k}>
                        {label}
                        {supported ? "" : " — " + t("alerts.unsupportedSuffix")}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>
          <SymbolPicker
            inputId="strategy-alert-symbol"
            listId="strategy-alert-symbol-suggestions"
            value={symbol}
            onChange={setSymbol}
            placeholder="AAPL"
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
              <select
                value={overrideStrategy || portfolioStrategy || ""}
                onChange={(e) => setOverrideStrategy(e.target.value as StrategyKind)}
                className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                {!portfolioStrategy && <option value="">{t("alerts.fromPortfolio.selectStrategyPrompt")}</option>}
                {STRATEGY_GROUP_ORDER.map((group) => (
                  <optgroup key={group} label={t(`learnStrategies.group.${group}`)}>
                    {STRATEGY_GROUPS[group].map((k) => {
                      const supported = STRATEGY_ALERT_TEMPLATES[k].length > 0;
                      return (
                        <option key={k} value={k}>
                          {STRATEGY_GUIDE[lang][k].label}
                          {supported ? "" : " — " + t("alerts.unsupportedSuffix")}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
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
          >
            <Wand2 className="mr-1 h-3.5 w-3.5" />
            {t("alerts.fromPortfolio.generate", { count: totalAlerts })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Alerts list (3 groups, collapsible sub-groups) ──────────────────────────

type AlertListItem = {
  id: string;
  symbol: string;
  conditionType: string;
  threshold: number;
  indicatorParams: AlertIndicatorParams | null;
  source: AlertSource;
  assetType: string | null;
  strategyKind: string | null;
  portfolioId: string | null;
  enabled: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
};

type SubGroup = {
  key: string;
  label: string;
  alerts: AlertListItem[];
};

const ASSET_TYPE_ORDER: AssetTypeKey[] = ["stock", "etf", "mutualfund", "commodity", "crypto", "index"];

function AlertsList({
  alerts,
  lang,
  portfolioTitleMap,
}: {
  alerts: AlertListItem[];
  lang: "en" | "fr";
  portfolioTitleMap: Map<string, string>;
}) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const toggleOne = trpc.alert.toggle.useMutation({
    onSuccess: () => void utils.alert.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteOne = trpc.alert.delete.useMutation({
    onSuccess: () => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.deleted"));
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleMany = trpc.alert.toggleMany.useMutation({
    onSuccess: () => void utils.alert.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
  const deleteMany = trpc.alert.deleteMany.useMutation({
    onSuccess: (data) => {
      void utils.alert.list.invalidate();
      toast.success(t("alerts.deletedMany", { count: data.count }));
    },
    onError: (e) => toast.error(e.message),
  });

  // Partition alerts by source
  const { manualSubs, strategySymbolSubs, strategyPortfolioSubs } = useMemo(() => {
    const manualMap = new Map<string, AlertListItem[]>();
    const stratSymMap = new Map<string, AlertListItem[]>();
    const stratPfMap = new Map<string, AlertListItem[]>();
    for (const a of alerts) {
      if (a.source === "manual") {
        const key = a.assetType ?? "other";
        (manualMap.get(key) ?? manualMap.set(key, []).get(key)!).push(a);
      } else if (a.source === "strategy_symbol") {
        const key = `${a.symbol}::${a.strategyKind ?? ""}`;
        (stratSymMap.get(key) ?? stratSymMap.set(key, []).get(key)!).push(a);
      } else if (a.source === "strategy_portfolio") {
        const key = `${a.portfolioId ?? ""}::${a.strategyKind ?? ""}`;
        (stratPfMap.get(key) ?? stratPfMap.set(key, []).get(key)!).push(a);
      }
    }

    const assetLabel = (k: string) => {
      if (k === "stock") return t("analysis.assetStock");
      if (k === "etf") return t("analysis.assetEtf");
      if (k === "mutualfund") return t("analysis.assetMutualFund");
      if (k === "commodity") return t("analysis.assetCommodity");
      if (k === "crypto") return t("analysis.assetCrypto");
      if (k === "index") return t("analysis.assetIndex");
      return t("alerts.group.unclassified");
    };

    const manualSubs: SubGroup[] = [...manualMap.keys()]
      .sort((a, b) => {
        const ia = ASSET_TYPE_ORDER.indexOf(a as AssetTypeKey);
        const ib = ASSET_TYPE_ORDER.indexOf(b as AssetTypeKey);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
      .map((k) => ({ key: k, label: assetLabel(k), alerts: manualMap.get(k)! }));

    const stratLabel = (k: StrategyKind | null | undefined) =>
      k && STRATEGY_GUIDE[lang][k as StrategyKind] ? STRATEGY_GUIDE[lang][k as StrategyKind].label : String(k ?? "");

    const strategySymbolSubs: SubGroup[] = [...stratSymMap.entries()]
      .map(([key, list]) => {
        const first = list[0]!;
        return {
          key,
          label: `${first.symbol} · ${stratLabel(first.strategyKind as StrategyKind | null)}`,
          alerts: list,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const strategyPortfolioSubs: SubGroup[] = [...stratPfMap.entries()]
      .map(([key, list]) => {
        const first = list[0]!;
        const pfTitle = portfolioTitleMap.get(first.portfolioId ?? "") ?? t("alerts.group.deletedPortfolio");
        return {
          key,
          label: `${pfTitle} · ${stratLabel(first.strategyKind as StrategyKind | null)}`,
          alerts: list,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return { manualSubs, strategySymbolSubs, strategyPortfolioSubs };
  }, [alerts, lang, portfolioTitleMap, t]);

  async function onToggleSubGroup(sub: SubGroup, nextEnabled: boolean) {
    await toggleMany.mutateAsync({ ids: sub.alerts.map((a) => a.id), enabled: nextEnabled });
  }
  async function onDeleteSubGroup(sub: SubGroup) {
    if (!confirm(t("alerts.confirmDeleteGroup", { count: sub.alerts.length }))) return;
    await deleteMany.mutateAsync({ ids: sub.alerts.map((a) => a.id) });
  }

  const total = alerts.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">{t("alerts.list")}</CardTitle>
        <span className="text-[10px] text-[var(--color-muted-fg)]">{t("alerts.totalCount", { count: total })}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="py-4 text-center text-xs text-[var(--color-muted-fg)]">{t("alerts.empty")}</p>
        ) : (
          <>
            <AlertGroup
              title={t("alerts.group.manual")}
              subGroups={manualSubs}
              allowIndividualActions
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={(id, enabled) => toggleOne.mutate({ id, enabled })}
              onDeleteOne={(id) => {
                if (!confirm(t("alerts.confirmDelete"))) return;
                deleteOne.mutate({ id });
              }}
            />
            <AlertGroup
              title={t("alerts.group.strategySymbol")}
              subGroups={strategySymbolSubs}
              allowIndividualActions={false}
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={() => {}}
              onDeleteOne={() => {}}
            />
            <AlertGroup
              title={t("alerts.group.strategyPortfolio")}
              subGroups={strategyPortfolioSubs}
              allowIndividualActions={false}
              onToggleSubGroup={onToggleSubGroup}
              onDeleteSubGroup={onDeleteSubGroup}
              onToggleOne={() => {}}
              onDeleteOne={() => {}}
            />
          </>
        )}
        <p className="mt-3 text-[10px] text-[var(--color-muted-fg)]">{t("alerts.cooldownHint")}</p>
      </CardContent>
    </Card>
  );
}

function AlertGroup({
  title,
  subGroups,
  allowIndividualActions,
  onToggleSubGroup,
  onDeleteSubGroup,
  onToggleOne,
  onDeleteOne,
}: {
  title: string;
  subGroups: SubGroup[];
  allowIndividualActions: boolean;
  onToggleSubGroup: (sub: SubGroup, nextEnabled: boolean) => void;
  onDeleteSubGroup: (sub: SubGroup) => void;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(true);
  const total = subGroups.reduce((acc, s) => acc + s.alerts.length, 0);
  return (
    <div className="rounded border border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-[var(--color-muted)]/50"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span>{title}</span>
        <span className="ml-auto text-[10px] text-[var(--color-muted-fg)]">
          {t("alerts.totalCount", { count: total })}
        </span>
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] pl-6">
          {subGroups.length === 0 ? (
            <p className="px-3 py-3 text-center text-[10px] text-[var(--color-muted-fg)]">
              {t("alerts.group.emptyGroup")}
            </p>
          ) : (
            subGroups.map((sub) => (
              <SubGroupBlock
                key={sub.key}
                sub={sub}
                allowIndividualActions={allowIndividualActions}
                onToggle={(next) => onToggleSubGroup(sub, next)}
                onDelete={() => onDeleteSubGroup(sub)}
                onToggleOne={onToggleOne}
                onDeleteOne={onDeleteOne}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SubGroupBlock({
  sub,
  allowIndividualActions,
  onToggle,
  onDelete,
  onToggleOne,
  onDeleteOne,
}: {
  sub: SubGroup;
  allowIndividualActions: boolean;
  onToggle: (next: boolean) => void;
  onDelete: () => void;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(true);
  const allEnabled = sub.alerts.every((a) => a.enabled);
  const anyEnabled = sub.alerts.some((a) => a.enabled);
  const nextEnabled = !anyEnabled; // if any disabled, enable all; else disable all
  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-2 bg-[var(--color-muted)]/30 px-3 py-1.5 text-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-[var(--color-fg)] hover:underline"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          <span className="font-medium">{sub.label}</span>
        </button>
        <span className="text-[10px] text-[var(--color-muted-fg)]">
          {t("alerts.totalCount", { count: sub.alerts.length })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title={anyEnabled ? t("alerts.disableGroup") : t("alerts.enableGroup")}
            onClick={() => onToggle(nextEnabled)}
          >
            {allEnabled ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title={t("alerts.deleteGroup")} onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {open && (
        <div className="space-y-1 px-3 py-2">
          {sub.alerts.map((a) => (
            <AlertRow
              key={a.id}
              alert={a}
              allowIndividualActions={allowIndividualActions}
              onToggleOne={onToggleOne}
              onDeleteOne={onDeleteOne}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert: a,
  allowIndividualActions,
  onToggleOne,
  onDeleteOne,
}: {
  alert: AlertListItem;
  allowIndividualActions: boolean;
  onToggleOne: (id: string, enabled: boolean) => void;
  onDeleteOne: (id: string) => void;
}) {
  const { t } = useTranslation();
  const ct = a.conditionType as AlertConditionType;
  const paramsText = formatParams(a.indicatorParams);
  const thrText = formatThresholdValue(ct, a.threshold);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-1.5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/dashboard/analysis"
          search={{ symbol: a.symbol }}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          {a.symbol}
        </Link>
        <span className="text-xs text-[var(--color-muted-fg)]">
          {t(`alerts.conditionType.${ct}`, { defaultValue: ct })}
          {paramsText && ` · ${paramsText}`}
          {thrText && ` · ${thrText}`}
        </span>
        {a.triggeredAt && (
          <span
            className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            title={new Date(a.triggeredAt).toLocaleString()}
          >
            {t("alerts.triggered")}
          </span>
        )}
        {!a.enabled && (
          <span className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-fg)]">
            {t("alerts.disable")}
          </span>
        )}
      </div>
      {allowIndividualActions && (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title={a.enabled ? t("alerts.disable") : t("alerts.enable")}
            onClick={() => onToggleOne(a.id, !a.enabled)}
          >
            {a.enabled ? (
              <Bell className="h-3.5 w-3.5" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" />
            )}
          </Button>
          <Button size="sm" variant="ghost" title={t("alerts.delete")} onClick={() => onDeleteOne(a.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
