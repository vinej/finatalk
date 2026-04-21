import { createFileRoute, Link } from "@tanstack/react-router";
import {
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  type Time,
  createChart,
} from "lightweight-charts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { pickLang } from "@/lib/lang";
import { STRATEGY_GUIDE } from "@/lib/strategy-guide";
import { trpc } from "@/lib/trpc";
import {
  BACKTEST_STRATEGY_INDICATORS,
  BACKTEST_SUPPORTED_STRATEGIES,
  DEFAULT_BACKTEST_CONFIG,
  SWEEP_PARAM_LABELS,
  generateSweepValues,
  runBacktest,
  runPortfolio,
  runSweep,
  type BacktestAnalyzeResult,
  type BacktestCandle,
  type BacktestConfig,
  type BacktestMetrics,
  type BacktestResult,
  type BacktestStrategy,
  type EquityPoint,
  type PortfolioResult,
  type SweepParam,
  type SweepResult,
  type Trade,
} from "@/lib/backtest-engine";
import type { IndicatorSpec } from "@/lib/indicator-defaults";
import type { Lang } from "@/lib/lang";

const BACKTEST_STATE_KEY = "finatalk:backtest-state";

const RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
const INTERVALS = ["1m", "5m", "15m", "30m", "60m", "90m", "1d", "1wk", "1mo"] as const;
type RangeValue = (typeof RANGES)[number];
type IntervalValue = (typeof INTERVALS)[number];

const INTRADAY_INTERVALS: readonly IntervalValue[] = ["1m", "5m", "15m", "30m", "60m", "90m"];

function compatibleRangesForInterval(i: IntervalValue): readonly RangeValue[] {
  if (i === "1m") return ["1d", "5d"];
  if (i === "5m" || i === "15m" || i === "30m" || i === "90m") return ["1d", "5d", "1mo"];
  if (i === "60m") return ["1d", "5d", "1mo", "3mo", "6mo", "1y"];
  return ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"];
}

function defaultRangeForInterval(i: IntervalValue): RangeValue {
  if (i === "1m") return "5d";
  if ((INTRADAY_INTERVALS as readonly string[]).includes(i)) return i === "60m" ? "1mo" : "5d";
  return "2y";
}

function clampRangeForInterval(r: RangeValue, i: IntervalValue): RangeValue {
  const allowed = compatibleRangesForInterval(i);
  return allowed.includes(r) ? r : defaultRangeForInterval(i);
}

type BacktestMode = "single" | "sweep" | "adhocPortfolio" | "userPortfolio";

type AdHocLeg = { symbol: string; weight: number };

type PersistedState = {
  symbolInput: string;
  submittedSymbol: string;
  range: RangeValue;
  interval: IntervalValue;
  strategy: BacktestStrategy;
  config: BacktestConfig;
  assetTypeFilter?: AssetTypeFilter;
  exchangeFilter?: string;
  mode?: BacktestMode;
  portfolioSymbols?: string[];
  adhocLegs?: AdHocLeg[];
  userPortfolioId?: string | null;
};

function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BACKTEST_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(s: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BACKTEST_STATE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export const Route = createFileRoute("/_auth/dashboard_/backtest")({
  component: BacktestPage,
});

function BacktestPage() {
  const { t, i18n } = useTranslation();
  const lang = pickLang(i18n.language);
  const persisted = useMemo(() => loadState(), []);

  const [symbolInput, setSymbolInput] = useState(persisted?.symbolInput ?? "AAPL");
  const [submittedSymbol, setSubmittedSymbol] = useState(
    persisted?.submittedSymbol ?? "AAPL",
  );
  const [range, setRange] = useState<RangeValue>(persisted?.range ?? "2y");
  const [interval, setIntervalValue] = useState<IntervalValue>(persisted?.interval ?? "1d");
  const [strategy, setStrategy] = useState<BacktestStrategy>(
    persisted?.strategy ?? "trendPullback",
  );
  const [config, setConfig] = useState<BacktestConfig>(() => ({
    ...DEFAULT_BACKTEST_CONFIG,
    ...(persisted?.config ?? {}),
  }));
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>(
    persisted?.assetTypeFilter ?? "all",
  );
  const [exchangeFilter, setExchangeFilter] = useState<string>(
    persisted?.exchangeFilter ?? "all",
  );
  const [mode, setMode] = useState<BacktestMode>(() => {
    const m = persisted?.mode;
    // Migrate legacy "portfolio" value to the new "adhocPortfolio".
    if ((m as string) === "portfolio") return "adhocPortfolio";
    return m ?? "single";
  });
  const [adhocLegs, setAdhocLegs] = useState<AdHocLeg[]>(() => {
    if (persisted?.adhocLegs && persisted.adhocLegs.length > 0) return persisted.adhocLegs;
    const legacy = persisted?.portfolioSymbols ?? [];
    return legacy.map((s) => ({ symbol: s, weight: 1 }));
  });
  const [submittedAdhocLegs, setSubmittedAdhocLegs] = useState<AdHocLeg[]>([]);
  const [userPortfolioId, setUserPortfolioId] = useState<string | null>(
    persisted?.userPortfolioId ?? null,
  );
  const [submittedUserPortfolioId, setSubmittedUserPortfolioId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    saveState({
      symbolInput, submittedSymbol, range, interval, strategy, config,
      assetTypeFilter, exchangeFilter, mode,
      adhocLegs, userPortfolioId,
    });
  }, [
    symbolInput, submittedSymbol, range, interval, strategy, config,
    assetTypeFilter, exchangeFilter, mode, adhocLegs, userPortfolioId,
  ]);

  const indicators = useMemo(() => BACKTEST_STRATEGY_INDICATORS[strategy], [strategy]);

  const query = trpc.market.analyze.useQuery(
    { symbol: submittedSymbol, range, interval, indicators, convertTo: null },
    { retry: false, staleTime: 60_000, enabled: submittedSymbol.length > 0 },
  );

  const result: BacktestResult | null = useMemo(() => {
    if (!query.data) return null;
    return runBacktest(query.data.candles, query.data.results, strategy, config, lang);
  }, [query.data, strategy, config, lang]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sym = symbolInput.trim().toUpperCase();
    if (sym) setSubmittedSymbol(sym);
    setPanelOpen(false);
  }

  function runAdhoc() {
    setSubmittedAdhocLegs(adhocLegs);
    setPanelOpen(false);
  }

  function runUserPortfolio() {
    setSubmittedUserPortfolioId(userPortfolioId);
    setPanelOpen(false);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="shrink-0">
        <CardHeader className="flex flex-row items-start gap-2">
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-label={panelOpen ? t("backtest.collapse") : t("backtest.expand")}
            className="mt-1 rounded-md p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
          >
            {panelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <div className="flex-1">
            <CardTitle>{t("backtest.title")}</CardTitle>
            {panelOpen && (
              <p className="text-sm text-[var(--color-muted-fg)]">{t("backtest.intro")}</p>
            )}
          </div>
        </CardHeader>
        {panelOpen && (
        <CardContent>
          <div className="flex gap-1 border-b border-[var(--color-border)]">
            {(["single", "sweep", "adhocPortfolio", "userPortfolio"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  "px-3 py-1.5 text-sm font-medium " +
                  (mode === m
                    ? "border-b-2 border-[var(--color-primary)] text-[var(--color-fg)]"
                    : "text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]")
                }
              >
                {t(`backtest.mode.${m}`)}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-end gap-3">
            {(mode === "single" || mode === "sweep") && (
              <SymbolPicker
                inputId="bt-symbol"
                listId="bt-symbol-suggestions"
                value={symbolInput}
                onChange={setSymbolInput}
                maxLength={20}
                inputClassName="h-10 w-48 uppercase"
                assetTypeFilter={assetTypeFilter}
                onAssetTypeChange={setAssetTypeFilter}
                exchangeFilter={exchangeFilter}
                onExchangeChange={setExchangeFilter}
              />
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="range">{t("backtest.range")}</Label>
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
              <Label htmlFor="interval">{t("backtest.interval")}</Label>
              <select
                id="interval"
                value={interval}
                onChange={(e) => {
                  const next = e.target.value as IntervalValue;
                  setIntervalValue(next);
                  setRange((r) => clampRangeForInterval(r, next));
                }}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                {INTERVALS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="strategy">{t("backtest.strategy")}</Label>
              <select
                id="strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as BacktestStrategy)}
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
              >
                {BACKTEST_SUPPORTED_STRATEGIES.map((s) => (
                  <option key={s} value={s}>{STRATEGY_GUIDE[lang][s].label}</option>
                ))}
              </select>
            </div>
            {(mode === "single" || mode === "sweep") && (
              <Button type="submit" className="h-10 border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:opacity-90">{t("backtest.run")}</Button>
            )}
          </form>
          <ConfigPanel config={config} onChange={setConfig} />
          {mode === "adhocPortfolio" && (
            <PortfolioSymbolsEditor
              legs={adhocLegs}
              onChange={setAdhocLegs}
              onRun={runAdhoc}
              assetTypeFilter={assetTypeFilter}
              onAssetTypeChange={setAssetTypeFilter}
              exchangeFilter={exchangeFilter}
              onExchangeChange={setExchangeFilter}
            />
          )}
          {mode === "userPortfolio" && (
            <UserPortfolioPicker
              value={userPortfolioId}
              onChange={setUserPortfolioId}
              onRun={runUserPortfolio}
            />
          )}
          <p className="mt-3 text-xs text-[var(--color-muted-fg)]">
            {t("backtest.phase2Note")}{" "}
            <Link to="/dashboard/strategies" className="underline underline-offset-2">
              {t("backtest.learnStrategiesLink")}
            </Link>
          </p>
        </CardContent>
        )}
      </Card>

      <div className="min-h-0 flex-1 overflow-auto">
        {query.isLoading && (
          <Card><CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">{t("backtest.loading")}</CardContent></Card>
        )}
        {query.error && (
          <Card><CardContent className="py-6 text-sm text-red-600">{query.error.message}</CardContent></Card>
        )}
        {mode === "single" && result && (
          <div className="flex flex-col gap-4">
            <MetricsCard metrics={result.metrics} />
            <EquityCurveCard equity={result.equityCurve} benchmark={result.benchmarkCurve} />
            <TradesCard trades={result.trades} />
          </div>
        )}
        {mode === "sweep" && query.data && (
          <SweepView
            candles={query.data.candles}
            analyzeResults={query.data.results}
            strategy={strategy}
            baseConfig={config}
            lang={lang}
          />
        )}
        {mode === "adhocPortfolio" && (
          <PortfolioView
            legs={submittedAdhocLegs}
            strategy={strategy}
            indicators={indicators}
            range={range}
            interval={interval}
            baseConfig={config}
            lang={lang}
            primarySymbol={submittedSymbol}
            titleKey="backtest.mode.adhocPortfolio"
          />
        )}
        {mode === "userPortfolio" && (
          <UserPortfolioView
            portfolioId={submittedUserPortfolioId}
            strategy={strategy}
            indicators={indicators}
            range={range}
            interval={interval}
            baseConfig={config}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

function ConfigPanel({
  config,
  onChange,
}: {
  config: BacktestConfig;
  onChange: (c: BacktestConfig) => void;
}) {
  const { t } = useTranslation();
  function update<K extends keyof BacktestConfig>(k: K, v: BacktestConfig[K]) {
    onChange({ ...config, [k]: v });
  }
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-6">
      <NumField
        label={t("backtest.initialCapital")}
        value={config.initialCapital}
        step={1000}
        min={100}
        onChange={(v) => update("initialCapital", v)}
      />
      <NumField
        label={t("backtest.riskPct")}
        value={config.riskPct}
        step={0.25}
        min={0.1}
        max={10}
        onChange={(v) => update("riskPct", v)}
        suffix="%"
      />
      <NumField
        label={t("backtest.stopAtrMult")}
        value={config.stopAtrMult}
        step={0.5}
        min={0.5}
        max={10}
        onChange={(v) => update("stopAtrMult", v)}
        suffix="×"
      />
      <NumField
        label={t("backtest.takeProfitR")}
        value={config.takeProfitR}
        step={0.5}
        min={0.5}
        max={10}
        onChange={(v) => update("takeProfitR", v)}
        suffix="R"
      />
      <NumField
        label={t("backtest.feeBps")}
        value={config.feeBps}
        step={1}
        min={0}
        max={200}
        onChange={(v) => update("feeBps", v)}
        suffix="bps"
      />
      <NumField
        label={t("backtest.slippageBps")}
        value={config.slippageBps}
        step={1}
        min={0}
        max={200}
        onChange={(v) => update("slippageBps", v)}
        suffix="bps"
      />
      <label className="flex cursor-pointer items-center gap-2 self-end rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
        <input
          type="checkbox"
          checked={config.enableShorts}
          onChange={(e) => update("enableShorts", e.target.checked)}
          className="h-4 w-4"
        />
        {t("backtest.enableShorts")}
      </label>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  step,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}{suffix ? ` (${suffix})` : ""}</Label>
      <Input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
      />
    </div>
  );
}

function MetricsCard({ metrics: m }: { metrics: BacktestMetrics }) {
  const { t } = useTranslation();
  const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const fmtUSD = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("backtest.metrics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric label={t("backtest.totalReturn")} value={fmtPct(m.totalReturn)} highlight={m.totalReturn >= 0 ? "pos" : "neg"} />
          <Metric
            label={t("backtest.benchmarkReturn")}
            value={fmtPct(m.benchmarkTotalReturn)}
            highlight={m.benchmarkTotalReturn >= 0 ? "pos" : "neg"}
          />
          <Metric label={t("backtest.cagr")} value={fmtPct(m.cagr)} highlight={m.cagr >= 0 ? "pos" : "neg"} />
          <Metric label={t("backtest.maxDrawdown")} value={`-${m.maxDrawdown.toFixed(2)}%`} highlight="neg" />
          <Metric label={t("backtest.sharpe")} value={m.sharpe.toFixed(2)} />
          <Metric label={t("backtest.winRate")} value={`${m.winRate.toFixed(1)}%`} />
          <Metric label={t("backtest.avgR")} value={`${m.avgRMultiple >= 0 ? "+" : ""}${m.avgRMultiple.toFixed(2)}R`} />
          <Metric
            label={t("backtest.tradeCount")}
            value={`${m.tradeCount} (${m.winningTrades}/${m.losingTrades})`}
            sub={m.shortTrades > 0 ? t("backtest.longShortBreakdown", { long: m.longTrades, short: m.shortTrades }) : undefined}
          />
          <Metric label={t("backtest.finalEquity")} value={fmtUSD(m.finalEquity)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  highlight?: "pos" | "neg";
  sub?: string;
}) {
  const color =
    highlight === "pos" ? "text-green-600" : highlight === "neg" ? "text-red-600" : "";
  return (
    <div className="rounded-md border border-[var(--color-border)] p-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-[var(--color-muted-fg)]">{sub}</div>}
    </div>
  );
}

function EquityCurveCard({
  equity,
  benchmark,
}: {
  equity: EquityPoint[];
  benchmark: EquityPoint[];
}) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const benchmarkSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#e5e7eb" : "#1f2937";
    const gridColor = isDark ? "#374151" : "#e5e7eb";
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      timeScale: { timeVisible: false, secondsVisible: false },
      rightPriceScale: { borderColor: gridColor },
    });
    chartRef.current = chart;
    equitySeriesRef.current = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
      title: "Strategy",
    });
    benchmarkSeriesRef.current = chart.addSeries(LineSeries, {
      color: "#94a3b8",
      lineWidth: 1,
      lineStyle: 2,
      title: "Buy & Hold",
    });
    return () => {
      chart.remove();
      chartRef.current = null;
      equitySeriesRef.current = null;
      benchmarkSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const eq = equitySeriesRef.current;
    const bm = benchmarkSeriesRef.current;
    if (!eq || !bm) return;
    eq.setData(
      equity.map((p) => ({
        time: Math.floor(p.time / 1000) as Time,
        value: p.equity,
      })),
    );
    bm.setData(
      benchmark.map((p) => ({
        time: Math.floor(p.time / 1000) as Time,
        value: p.equity,
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [equity, benchmark]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{t("backtest.equityCurve")}</CardTitle>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-muted-fg)]">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-[#2563eb]" /> {t("backtest.legendStrategy")}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 border-t border-dashed border-[#94a3b8]" /> {t("backtest.legendBenchmark")}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}

function TradesCard({ trades }: { trades: Trade[] }) {
  const { t } = useTranslation();
  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">
          {t("backtest.noTrades")}
        </CardContent>
      </Card>
    );
  }
  const fmtDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const fmtNum = (n: number) => n.toFixed(2);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("backtest.trades")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted-fg)]">
                <th className="px-2 py-1.5 text-left">#</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.side")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.entryDate")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.entryPrice")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.exitDate")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.exitPrice")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.qty")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.bars")}</th>
                <th className="px-2 py-1.5 text-left">{t("backtest.exitReason")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.pnl")}</th>
                <th className="px-2 py-1.5 text-right">R</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((tr, i) => {
                const tipLines = [
                  `${t("backtest.side")}: ${t(`backtest.sideLabel.${tr.side}`)}`,
                  `${t("backtest.entryPrice")}: ${fmtNum(tr.entryPrice)}`,
                  `${t("backtest.stopLevel")}: ${fmtNum(tr.stop)}`,
                  `${t("backtest.tpLevel")}: ${fmtNum(tr.takeProfit)}`,
                  `${t("backtest.exitPrice")}: ${fmtNum(tr.exitPrice)}`,
                  `${t("backtest.bars")}: ${tr.bars}`,
                  `${t("backtest.exitReason")}: ${t(`backtest.reason.${tr.reason}`)}`,
                  `R: ${tr.rMultiple >= 0 ? "+" : ""}${tr.rMultiple.toFixed(2)}`,
                ].join("\n");
                return (
                <tr key={i} className="border-b border-[var(--color-border)]/50 last:border-0" title={tipLines}>
                  <td className="px-2 py-1.5 text-[var(--color-muted-fg)]">{i + 1}</td>
                  <td className={`px-2 py-1.5 text-xs font-medium ${tr.side === "long" ? "text-green-600" : "text-red-600"}`}>
                    {t(`backtest.sideLabel.${tr.side}`)}
                  </td>
                  <td className="px-2 py-1.5">{fmtDate(tr.entryTime)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtNum(tr.entryPrice)}</td>
                  <td className="px-2 py-1.5">{fmtDate(tr.exitTime)}</td>
                  <td className="px-2 py-1.5 text-right">{fmtNum(tr.exitPrice)}</td>
                  <td className="px-2 py-1.5 text-right">{tr.qty}</td>
                  <td className="px-2 py-1.5 text-right">{tr.bars}</td>
                  <td className="px-2 py-1.5 text-xs" title={tipLines}>
                    {t(`backtest.reason.${tr.reason}`)}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-medium ${tr.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {tr.pnl >= 0 ? "+" : ""}{fmtNum(tr.pnl)} ({tr.pnlPct >= 0 ? "+" : ""}{tr.pnlPct.toFixed(2)}%)
                  </td>
                  <td className={`px-2 py-1.5 text-right ${tr.rMultiple >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {tr.rMultiple >= 0 ? "+" : ""}{tr.rMultiple.toFixed(2)}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sweep view
// ---------------------------------------------------------------------------

const SWEEP_PARAMS: readonly SweepParam[] = ["stopAtrMult", "takeProfitR", "riskPct"];

type SweepMetricKey = "totalReturn" | "cagr" | "sharpe" | "maxDrawdown" | "winRate";

const SWEEP_METRIC_KEYS: readonly SweepMetricKey[] = [
  "totalReturn", "cagr", "sharpe", "maxDrawdown", "winRate",
];

function sweepMetricValue(m: BacktestMetrics, key: SweepMetricKey): number {
  if (key === "totalReturn") return m.totalReturn;
  if (key === "cagr") return m.cagr;
  if (key === "sharpe") return m.sharpe;
  if (key === "maxDrawdown") return -m.maxDrawdown;
  return m.winRate;
}

function fmtSweepMetric(v: number, key: SweepMetricKey): string {
  if (key === "sharpe") return v.toFixed(2);
  if (key === "maxDrawdown") return `${v.toFixed(1)}%`;
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function SweepView({
  candles,
  analyzeResults,
  strategy,
  baseConfig,
  lang,
}: {
  candles: BacktestCandle[];
  analyzeResults: BacktestAnalyzeResult[];
  strategy: BacktestStrategy;
  baseConfig: BacktestConfig;
  lang: Lang;
}) {
  const { t } = useTranslation();
  const [xParam, setXParam] = useState<SweepParam>("stopAtrMult");
  const [yParam, setYParam] = useState<SweepParam>("takeProfitR");
  const [xMin, setXMin] = useState(1);
  const [xMax, setXMax] = useState(3);
  const [xStep, setXStep] = useState(0.5);
  const [yMin, setYMin] = useState(1);
  const [yMax, setYMax] = useState(3);
  const [yStep, setYStep] = useState(0.5);
  const [metricKey, setMetricKey] = useState<SweepMetricKey>("totalReturn");

  const xValues = useMemo(() => generateSweepValues(xMin, xMax, xStep), [xMin, xMax, xStep]);
  const yValues = useMemo(() => generateSweepValues(yMin, yMax, yStep), [yMin, yMax, yStep]);
  const cellCount = xValues.length * yValues.length;
  const tooBig = cellCount > 64;
  const invalid = xParam === yParam || xValues.length === 0 || yValues.length === 0 || tooBig;

  const sweep: SweepResult | null = useMemo(() => {
    if (invalid) return null;
    return runSweep(
      candles,
      analyzeResults,
      strategy,
      baseConfig,
      { param: xParam, values: xValues },
      { param: yParam, values: yValues },
      lang,
    );
  }, [candles, analyzeResults, strategy, baseConfig, xParam, yParam, xValues, yValues, lang, invalid]);

  const { bestValue, worstValue, bestCell } = useMemo(() => {
    if (!sweep) return { bestValue: 0, worstValue: 0, bestCell: null as null | { x: number; y: number } };
    let bv = -Infinity;
    let wv = Infinity;
    let best: { x: number; y: number } | null = null;
    for (let yi = 0; yi < sweep.grid.length; yi++) {
      for (let xi = 0; xi < sweep.grid[yi]!.length; xi++) {
        const v = sweepMetricValue(sweep.grid[yi]![xi]!.metrics, metricKey);
        if (v > bv) { bv = v; best = { x: xi, y: yi }; }
        if (v < wv) wv = v;
      }
    }
    return { bestValue: bv, worstValue: wv, bestCell: best };
  }, [sweep, metricKey]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("backtest.sweep.title")}</CardTitle>
          <p className="text-xs text-[var(--color-muted-fg)]">{t("backtest.sweep.hint")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <AxisConfig
              axisLabel={t("backtest.sweep.xAxis")}
              param={xParam}
              setParam={setXParam}
              min={xMin}
              max={xMax}
              step={xStep}
              setMin={setXMin}
              setMax={setXMax}
              setStep={setXStep}
            />
            <AxisConfig
              axisLabel={t("backtest.sweep.yAxis")}
              param={yParam}
              setParam={setYParam}
              min={yMin}
              max={yMax}
              step={yStep}
              setMin={setYMin}
              setMax={setYMax}
              setStep={setYStep}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">{t("backtest.sweep.metric")}</Label>
              <select
                value={metricKey}
                onChange={(e) => setMetricKey(e.target.value as SweepMetricKey)}
                className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                {SWEEP_METRIC_KEYS.map((k) => (
                  <option key={k} value={k}>{t(`backtest.sweep.metric_${k}`)}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-[var(--color-muted-fg)]">
              {t("backtest.sweep.cellCount", { count: cellCount })}
            </span>
            {xParam === yParam && (
              <span className="text-xs text-red-600">{t("backtest.sweep.samePairError")}</span>
            )}
            {tooBig && (
              <span className="text-xs text-red-600">{t("backtest.sweep.tooBigError")}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {sweep && bestCell && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("backtest.sweep.results")}</CardTitle>
            <p className="text-xs text-[var(--color-muted-fg)]">
              {t("backtest.sweep.bestCell", {
                x: xValues[bestCell.x],
                xParam: t(`backtest.sweep.param_${xParam}`),
                y: yValues[bestCell.y],
                yParam: t(`backtest.sweep.param_${yParam}`),
                value: fmtSweepMetric(bestValue, metricKey),
              })}
            </p>
          </CardHeader>
          <CardContent>
            <SweepHeatmap
              sweep={sweep}
              metricKey={metricKey}
              bestValue={bestValue}
              worstValue={worstValue}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AxisConfig({
  axisLabel,
  param,
  setParam,
  min,
  max,
  step,
  setMin,
  setMax,
  setStep,
}: {
  axisLabel: string;
  param: SweepParam;
  setParam: (v: SweepParam) => void;
  min: number;
  max: number;
  step: number;
  setMin: (n: number) => void;
  setMax: (n: number) => void;
  setStep: (n: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-[var(--color-border)] p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
        {axisLabel}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-4 grid gap-1.5">
          <Label className="text-xs">{t("backtest.sweep.parameter")}</Label>
          <select
            value={param}
            onChange={(e) => setParam(e.target.value as SweepParam)}
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
          >
            {SWEEP_PARAMS.map((p) => (
              <option key={p} value={p}>{SWEEP_PARAM_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <NumField label={t("backtest.sweep.min")} value={min} step={0.25} onChange={setMin} />
        <NumField label={t("backtest.sweep.max")} value={max} step={0.25} onChange={setMax} />
        <NumField label={t("backtest.sweep.step")} value={step} step={0.25} min={0.05} onChange={setStep} />
      </div>
    </div>
  );
}

function SweepHeatmap({
  sweep,
  metricKey,
  bestValue,
  worstValue,
}: {
  sweep: SweepResult;
  metricKey: SweepMetricKey;
  bestValue: number;
  worstValue: number;
}) {
  const range = bestValue - worstValue;
  function bgFor(v: number) {
    if (range <= 0) return "transparent";
    const norm = (v - worstValue) / range; // 0..1
    if (v >= 0) {
      const alpha = (norm * 0.8).toFixed(2);
      return `rgba(16, 185, 129, ${alpha})`;
    } else {
      const alpha = ((1 - norm) * 0.8).toFixed(2);
      return `rgba(239, 68, 68, ${alpha})`;
    }
  }
  return (
    <div className="overflow-auto">
      <table className="text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 text-right text-[var(--color-muted-fg)]">
              {SWEEP_PARAM_LABELS[sweep.yAxis.param]} \ {SWEEP_PARAM_LABELS[sweep.xAxis.param]}
            </th>
            {sweep.xAxis.values.map((x) => (
              <th key={x} className="px-2 py-1 text-right font-mono text-[var(--color-muted-fg)]">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sweep.grid.map((row, yi) => (
            <tr key={yi}>
              <td className="px-2 py-1 text-right font-mono text-[var(--color-muted-fg)]">
                {sweep.yAxis.values[yi]}
              </td>
              {row.map((cell, xi) => {
                const v = sweepMetricValue(cell.metrics, metricKey);
                return (
                  <td
                    key={xi}
                    className="px-2 py-1 text-right font-mono"
                    style={{ backgroundColor: bgFor(v) }}
                    title={[
                      `${SWEEP_PARAM_LABELS[sweep.xAxis.param]}: ${sweep.xAxis.values[xi]}`,
                      `${SWEEP_PARAM_LABELS[sweep.yAxis.param]}: ${sweep.yAxis.values[yi]}`,
                      `Return: ${cell.metrics.totalReturn.toFixed(2)}%`,
                      `Sharpe: ${cell.metrics.sharpe.toFixed(2)}`,
                      `Max DD: ${cell.metrics.maxDrawdown.toFixed(2)}%`,
                      `Trades: ${cell.trades}`,
                    ].join("\n")}
                  >
                    {fmtSweepMetric(v, metricKey)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Portfolio view
// ---------------------------------------------------------------------------

function PortfolioSymbolsEditor({
  legs,
  onChange,
  onRun,
  assetTypeFilter,
  onAssetTypeChange,
  exchangeFilter,
  onExchangeChange,
}: {
  legs: AdHocLeg[];
  onChange: (next: AdHocLeg[]) => void;
  onRun: () => void;
  assetTypeFilter: AssetTypeFilter;
  onAssetTypeChange: (v: AssetTypeFilter) => void;
  exchangeFilter: string;
  onExchangeChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");

  const totalWeight = legs.reduce((s, l) => s + (Number.isFinite(l.weight) && l.weight > 0 ? l.weight : 0), 0);

  function add() {
    const sym = draft.trim().toUpperCase();
    if (!sym) return;
    if (legs.some((l) => l.symbol === sym)) {
      setDraft("");
      return;
    }
    if (legs.length >= 20) return;
    onChange([...legs, { symbol: sym, weight: 1 }]);
    setDraft("");
  }

  function updateWeight(symbol: string, weight: number) {
    onChange(legs.map((l) => (l.symbol === symbol ? { ...l, weight } : l)));
  }

  function remove(symbol: string) {
    onChange(legs.filter((l) => l.symbol !== symbol));
  }

  function equalize() {
    if (legs.length === 0) return;
    onChange(legs.map((l) => ({ ...l, weight: 1 })));
  }

  return (
    <div className="mt-4 rounded-md border border-[var(--color-border)] p-3">
      <div className="mb-2 flex flex-wrap items-end gap-3">
        <SymbolPicker
          inputId="bt-port-symbol"
          listId="bt-port-symbol-suggestions"
          value={draft}
          onChange={setDraft}
          maxLength={20}
          inputClassName="h-10 w-48 uppercase"
          assetTypeFilter={assetTypeFilter}
          onAssetTypeChange={onAssetTypeChange}
          exchangeFilter={exchangeFilter}
          onExchangeChange={onExchangeChange}
        />
        <Button
          type="button"
          className="h-10"
          onClick={add}
          disabled={!draft.trim() || legs.length >= 20}
        >
          {t("backtest.portfolio.add")}
        </Button>
        {legs.length > 0 && (
          <Button type="button" variant="outline" className="h-10" onClick={equalize}>
            {t("backtest.portfolio.equalize")}
          </Button>
        )}
      </div>
      {legs.length === 0 ? (
        <p className="text-xs text-[var(--color-muted-fg)]">{t("backtest.portfolio.empty")}</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted-fg)]">
                <th className="px-2 py-1.5 text-left">{t("backtest.symbol")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.portfolio.weight")}</th>
                <th className="px-2 py-1.5 text-right">{t("backtest.portfolio.allocationPct")}</th>
                <th className="px-2 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {legs.map((leg) => {
                const pct = totalWeight > 0 ? (Math.max(0, leg.weight) / totalWeight) * 100 : 0;
                return (
                  <tr key={leg.symbol} className="border-b border-[var(--color-border)]/50 last:border-0">
                    <td className="px-2 py-1.5 font-mono">{leg.symbol}</td>
                    <td className="px-2 py-1.5 text-right">
                      <Input
                        type="number"
                        value={leg.weight}
                        step={0.1}
                        min={0}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v)) updateWeight(leg.symbol, v);
                        }}
                        className="ml-auto h-8 w-24 text-right"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-[var(--color-muted-fg)]">
                      {pct.toFixed(1)}%
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => remove(leg.symbol)}
                        className="text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                        aria-label={t("backtest.portfolio.remove")}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-[11px] text-[var(--color-muted-fg)]">
        {t("backtest.portfolio.allocationNote")}
      </p>
      <div className="mt-3">
        <Button type="button" onClick={onRun} disabled={legs.length === 0} className="h-10 border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:opacity-90">
          {t("backtest.run")}
        </Button>
      </div>
    </div>
  );
}

function PortfolioView({
  legs: portfolioLegs,
  strategy,
  indicators,
  range,
  interval,
  baseConfig,
  lang,
  primarySymbol,
  titleKey,
}: {
  legs: AdHocLeg[];
  strategy: BacktestStrategy;
  indicators: IndicatorSpec[];
  range: RangeValue;
  interval: IntervalValue;
  baseConfig: BacktestConfig;
  lang: Lang;
  primarySymbol: string;
  titleKey?: string;
}) {
  const { t } = useTranslation();
  const symbols = useMemo(() => portfolioLegs.map((l) => l.symbol), [portfolioLegs]);
  const weights = useMemo(() => {
    const w: Record<string, number> = {};
    for (const l of portfolioLegs) w[l.symbol] = l.weight;
    return w;
  }, [portfolioLegs]);

  const queries = trpc.useQueries((tq) =>
    symbols.map((s) =>
      tq.market.analyze(
        { symbol: s, range, interval, indicators, convertTo: null },
        { retry: false, staleTime: 60_000, enabled: s.length > 0 },
      ),
    ),
  );

  const loading = queries.some((q) => q.isLoading);
  const errors = queries
    .map((q, i) => (q.error ? { symbol: symbols[i]!, error: q.error.message } : null))
    .filter((e): e is { symbol: string; error: string } => !!e);

  const result: PortfolioResult | null = useMemo(() => {
    if (symbols.length === 0) return null;
    if (queries.some((q) => !q.data)) return null;
    const dataBySymbol: Record<string, { candles: BacktestCandle[]; results: BacktestAnalyzeResult[] }> = {};
    queries.forEach((q, i) => {
      if (q.data) dataBySymbol[symbols[i]!] = { candles: q.data.candles, results: q.data.results };
    });
    return runPortfolio(symbols, dataBySymbol, strategy, baseConfig, lang, weights);
  }, [symbols, queries, strategy, baseConfig, lang, weights]);

  if (symbols.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">
          {t("backtest.portfolio.noneHint", { primary: primarySymbol })}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <Card><CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">{t("backtest.loading")}</CardContent></Card>;
  }

  return (
    <div className="flex flex-col gap-4">
      {errors.length > 0 && (
        <Card>
          <CardContent className="py-4 text-xs text-red-600">
            {errors.map((e) => <div key={e.symbol}>{e.symbol}: {e.error}</div>)}
          </CardContent>
        </Card>
      )}
      {result && (
        <>
          <MetricsCard metrics={result.metrics} />
          <EquityCurveCard equity={result.equityCurve} benchmark={result.benchmarkCurve} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {titleKey ? t(titleKey) : t("backtest.portfolio.legs")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-xs uppercase text-[var(--color-muted-fg)]">
                      <th className="px-2 py-1.5 text-left">{t("backtest.symbol")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.portfolio.allocationPct")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.totalReturn")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.benchmarkReturn")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.sharpe")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.maxDrawdown")}</th>
                      <th className="px-2 py-1.5 text-right">{t("backtest.tradeCount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.legs.map((leg) => {
                      const m = leg.result.metrics;
                      return (
                        <tr key={leg.symbol} className="border-b border-[var(--color-border)]/50 last:border-0">
                          <td className="px-2 py-1.5 font-mono">{leg.symbol}</td>
                          <td className="px-2 py-1.5 text-right font-mono text-[var(--color-muted-fg)]">
                            {(leg.weight * 100).toFixed(1)}%
                          </td>
                          <td className={`px-2 py-1.5 text-right ${m.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {m.totalReturn >= 0 ? "+" : ""}{m.totalReturn.toFixed(2)}%
                          </td>
                          <td className="px-2 py-1.5 text-right text-[var(--color-muted-fg)]">
                            {m.benchmarkTotalReturn >= 0 ? "+" : ""}{m.benchmarkTotalReturn.toFixed(2)}%
                          </td>
                          <td className="px-2 py-1.5 text-right">{m.sharpe.toFixed(2)}</td>
                          <td className="px-2 py-1.5 text-right text-red-600">-{m.maxDrawdown.toFixed(2)}%</td>
                          <td className="px-2 py-1.5 text-right">{m.tradeCount} ({m.winningTrades}/{m.losingTrades})</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// User portfolio view
// ---------------------------------------------------------------------------

function UserPortfolioPicker({
  value,
  onChange,
  onRun,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  onRun: () => void;
}) {
  const { t } = useTranslation();
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const portfolios = portfoliosQuery.data ?? [];

  return (
    <div className="mt-4 rounded-md border border-[var(--color-border)] p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="bt-user-portfolio">{t("backtest.userPortfolio.pick")}</Label>
          <select
            id="bt-user-portfolio"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
            className="h-10 min-w-60 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
          >
            <option value="">{t("backtest.userPortfolio.none")}</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={onRun} disabled={!value} className="h-10 border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:opacity-90">
          {t("backtest.run")}
        </Button>
      </div>
      <p className="mt-2 text-[11px] text-[var(--color-muted-fg)]">
        {t("backtest.userPortfolio.note")}
      </p>
    </div>
  );
}

function UserPortfolioView({
  portfolioId,
  strategy,
  indicators,
  range,
  interval,
  baseConfig,
  lang,
}: {
  portfolioId: string | null;
  strategy: BacktestStrategy;
  indicators: IndicatorSpec[];
  range: RangeValue;
  interval: IntervalValue;
  baseConfig: BacktestConfig;
  lang: Lang;
}) {
  const { t } = useTranslation();
  const valuationQuery = trpc.portfolio.getValuation.useQuery(
    { id: portfolioId ?? "" },
    { enabled: !!portfolioId, retry: false, staleTime: 60_000 },
  );

  const legs: AdHocLeg[] = useMemo(() => {
    const rows = valuationQuery.data?.rows ?? [];
    // Aggregate by symbol (a portfolio can have multiple lots of the same symbol).
    const bySymbol = new Map<string, number>();
    for (const r of rows) {
      const sym = r.holding.symbol.toUpperCase();
      const mv = r.marketValue ?? 0;
      if (mv <= 0) continue;
      bySymbol.set(sym, (bySymbol.get(sym) ?? 0) + mv);
    }
    return [...bySymbol.entries()].map(([symbol, weight]) => ({ symbol, weight }));
  }, [valuationQuery.data]);

  if (!portfolioId) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">
          {t("backtest.userPortfolio.pickHint")}
        </CardContent>
      </Card>
    );
  }

  if (valuationQuery.isLoading) {
    return <Card><CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">{t("backtest.loading")}</CardContent></Card>;
  }

  if (valuationQuery.error) {
    return <Card><CardContent className="py-6 text-sm text-red-600">{valuationQuery.error.message}</CardContent></Card>;
  }

  if (legs.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-[var(--color-muted-fg)]">
          {t("backtest.userPortfolio.noHoldings")}
        </CardContent>
      </Card>
    );
  }

  return (
    <PortfolioView
      legs={legs}
      strategy={strategy}
      indicators={indicators}
      range={range}
      interval={interval}
      baseConfig={baseConfig}
      lang={lang}
      primarySymbol={legs[0]?.symbol ?? ""}
      titleKey="backtest.userPortfolio.legsTitle"
    />
  );
}
