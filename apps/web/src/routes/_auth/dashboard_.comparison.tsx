import { createFileRoute } from "@tanstack/react-router";
import {
  type ISeriesApi,
  LineSeries,
  type Time,
} from "lightweight-charts";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptionsSelect } from "@/components/ui/options-select";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { paletteColor } from "@/lib/chart-theme";
import { loadComparisonState, saveComparisonState } from "@/lib/comparison-persistence";
import { formatNum, formatPct } from "@/lib/format";
import { SYMBOL_RE } from "@/lib/symbol";
import { trpc } from "@/lib/trpc";
import { useLightweightChart } from "@/lib/use-lightweight-chart";

export const Route = createFileRoute("/_auth/dashboard_/comparison")({
  component: ComparisonPage,
});

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
type Range = (typeof RANGES)[number];

const INTERVALS = ["1d", "1wk", "1mo"] as const;
type Interval = (typeof INTERVALS)[number];

function ComparisonPage() {
  const { t } = useTranslation();

  const persisted = useMemo(() => loadComparisonState(), []);
  const [symbols, setSymbols] = useState<string[]>(
    (persisted?.symbols ?? []).filter((s) => SYMBOL_RE.test(s)),
  );
  const [inputValue, setInputValue] = useState("");
  const [range, setRange] = useState<Range>(persisted?.range ?? "6mo");
  const [interval, setInterval] = useState<Interval>(persisted?.interval ?? "1d");
  const [convertToCad, setConvertToCad] = useState(persisted?.convertToCad ?? false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>(persisted?.assetTypeFilter ?? "all");
  const [exchangeFilter, setExchangeFilter] = useState<string>(persisted?.exchangeFilter ?? "all");

  useEffect(() => {
    saveComparisonState({
      symbols,
      range,
      interval,
      convertToCad,
      assetTypeFilter,
      exchangeFilter,
    });
  }, [symbols, range, interval, convertToCad, assetTypeFilter, exchangeFilter]);

  function addSymbol(e: React.FormEvent) {
    e.preventDefault();
    const sym = inputValue.trim().toUpperCase();
    if (!sym || symbols.length >= 5 || symbols.includes(sym)) return;
    if (!SYMBOL_RE.test(sym)) return;
    setSymbols((prev) => [...prev, sym]);
    setInputValue("");
  }

  function removeSymbol(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym));
  }

  const compareQuery = trpc.market.compareSymbols.useQuery(
    {
      symbols,
      range,
      interval,
      convertTo: convertToCad ? "CAD" : null,
    },
    {
      enabled: symbols.length >= 2,
      staleTime: 60_000,
      retry: false,
    },
  );

  const data = compareQuery.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold">{t("comparison.title")}</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <form onSubmit={addSymbol} className="flex flex-wrap items-end gap-3">
              <SymbolPicker
                inputId="cmp-symbol"
                listId="comparison-symbol-suggestions"
                value={inputValue}
                onChange={setInputValue}
                placeholder={t("comparison.placeholder")}
                maxLength={20}
                inputClassName="h-8 w-40 uppercase"
                assetTypeFilter={assetTypeFilter}
                onAssetTypeChange={setAssetTypeFilter}
                exchangeFilter={exchangeFilter}
                onExchangeChange={setExchangeFilter}
              />
              <Button
                type="submit"
                size="sm"
                disabled={symbols.length >= 5 || !inputValue.trim()}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t("comparison.addSymbol")}
              </Button>
            </form>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="cmp-range"
                className="text-[10px] uppercase text-[var(--color-muted-fg)]"
              >
                {t("analysis.range")}
              </label>
              <OptionsSelect
                id="cmp-range"
                size="sm"
                value={range}
                onChange={setRange}
                options={RANGES}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="cmp-interval"
                className="text-[10px] uppercase text-[var(--color-muted-fg)]"
              >
                {t("analysis.interval")}
              </label>
              <OptionsSelect
                id="cmp-interval"
                size="sm"
                value={interval}
                onChange={setInterval}
                options={INTERVALS}
              />
            </div>

            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={convertToCad}
                onChange={(e) => setConvertToCad(e.target.checked)}
                className="rounded"
              />
              {t("analysis.showInCad")}
            </label>
          </div>

          {symbols.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {symbols.map((sym, i) => (
                <span
                  key={sym}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-2.5 py-1 text-sm font-medium"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: paletteColor(i) }}
                  />
                  {sym}
                  <button
                    type="button"
                    onClick={() => removeSymbol(sym)}
                    className="ml-0.5 rounded p-0.5 text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
                    title={t("comparison.removeSymbol")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {symbols.length >= 5 && (
                <span className="self-center text-xs text-[var(--color-muted-fg)]">
                  {t("comparison.max5")}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {symbols.length < 2 && (
        <p className="text-center text-sm text-[var(--color-muted-fg)]">
          {t("comparison.min2")}
        </p>
      )}

      {symbols.length >= 2 && compareQuery.isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("comparison.loading")}
        </div>
      )}

      {symbols.length >= 2 && compareQuery.isError && (
        <p className="text-center text-sm text-[var(--color-destructive)]">
          {t("comparison.loadFailed")}
        </p>
      )}

      {data.length >= 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {t("comparison.normalized")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonChart data={data} />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {data.map((d, i) => (
                  <span
                    key={d.symbol}
                    className="inline-flex items-center gap-1.5"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: paletteColor(i),
                      }}
                    />
                    <span className="text-[var(--color-fg)]">{d.symbol}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {t("comparison.metrics")}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <MetricsTable data={data} />
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}

type CompareItem = {
  symbol: string;
  candles: { time: number; close: number }[];
  periodReturn: number | null;
  volatility: number | null;
  rsi14: number | null;
  sma50: number | null;
  sma200: number | null;
  lastClose: number | null;
};

function ComparisonChart({ data }: { data: CompareItem[] }) {
  const { containerRef, chartRef } = useLightweightChart();
  const seriesRef = useRef<ISeriesApi<"Line">[]>([]);

  const seriesData = useMemo(
    () =>
      data.map((d, i) => {
        const candles = d.candles;
        if (candles.length === 0)
          return { color: paletteColor(i)!, points: [] as { time: Time; value: number }[] };
        const base = candles[0]!.close;
        if (!Number.isFinite(base) || base === 0)
          return { color: paletteColor(i)!, points: [] as { time: Time; value: number }[] };
        const points = candles.map((c) => ({
          time: c.time as Time,
          value: (c.close / base) * 100,
        }));
        return { color: paletteColor(i)!, points };
      }),
    [data],
  );

  useEffect(() => {
    return () => {
      seriesRef.current = [];
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    for (const s of seriesRef.current) chart.removeSeries(s);
    seriesRef.current = [];
    for (const { color, points } of seriesData) {
      if (points.length === 0) continue;
      const s = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      });
      s.setData(points);
      seriesRef.current.push(s);
    }
    if (seriesRef.current.length > 0) chart.timeScale().fitContent();
  }, [seriesData, chartRef]);

  return <div ref={containerRef} className="h-96 w-full" />;
}

function MetricsTable({ data }: { data: CompareItem[] }) {
  const { t } = useTranslation();

  const metrics: { label: string; getValue: (d: CompareItem) => string; align: "left" | "right"; tone?: (d: CompareItem) => "pos" | "neg" | "neutral" }[] = [
    {
      label: t("comparison.lastClose"),
      getValue: (d) => formatNum(d.lastClose),
      align: "right",
    },
    {
      label: t("comparison.periodReturn"),
      getValue: (d) => formatPct(d.periodReturn),
      align: "right",
      tone: (d) =>
        d.periodReturn == null
          ? "neutral"
          : d.periodReturn >= 0
            ? "pos"
            : "neg",
    },
    {
      label: t("comparison.volatility"),
      getValue: (d) => formatPct(d.volatility),
      align: "right",
    },
    {
      label: t("comparison.rsi14"),
      getValue: (d) => formatNum(d.rsi14, 1),
      align: "right",
    },
    {
      label: t("comparison.sma50"),
      getValue: (d) => formatNum(d.sma50),
      align: "right",
    },
    {
      label: t("comparison.sma200"),
      getValue: (d) => formatNum(d.sma200),
      align: "right",
    },
  ];

  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
          <th className="px-2 py-2 font-medium">{t("comparison.metrics")}</th>
          {data.map((d, i) => (
            <th key={d.symbol} className="px-2 py-2 text-right font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: paletteColor(i) }}
                />
                {d.symbol}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metrics.map((m) => (
          <tr
            key={m.label}
            className="border-b border-[var(--color-border)]"
          >
            <td className="px-2 py-2 text-xs font-medium text-[var(--color-muted-fg)]">
              {m.label}
            </td>
            {data.map((d) => {
              const tone = m.tone?.(d) ?? "neutral";
              const color =
                tone === "pos"
                  ? "text-[#10b981]"
                  : tone === "neg"
                    ? "text-[#ef4444]"
                    : "";
              return (
                <td
                  key={d.symbol}
                  className={`px-2 py-2 text-right tabular-nums ${color}`}
                >
                  {m.getValue(d)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
