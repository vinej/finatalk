import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { MarketChart } from "@/components/market-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { RouterInputs, RouterOutputs } from "@finatalk/trpc";

export const Route = createFileRoute("/_auth/dashboard_/markets")({
  component: MarketsPage,
});

type AnalyzeInput = RouterInputs["market"]["analyze"];
type IndicatorSpec = AnalyzeInput["indicators"][number];
type AnalyzeResult = RouterOutputs["market"]["analyze"]["results"][number];

type Preset = { id: string; label: string; spec: IndicatorSpec };

const PRESETS: Preset[] = [
  { id: "sma20", label: "SMA 20", spec: { kind: "sma", period: 20 } },
  { id: "ema50", label: "EMA 50", spec: { kind: "ema", period: 50 } },
  { id: "rsi14", label: "RSI 14", spec: { kind: "rsi", period: 14 } },
  { id: "macd", label: "MACD 12/26/9", spec: { kind: "macd", fast: 12, slow: 26, signal: 9 } },
  { id: "bb20", label: "BBands 20/2", spec: { kind: "bbands", period: 20, stdDev: 2 } },
];

const RANGES = ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] as const;
const INTERVALS = ["1d", "1wk", "1mo"] as const;

function MarketsPage() {
  const { t } = useTranslation();
  const [symbolInput, setSymbolInput] = useState("AAPL");
  const [submittedSymbol, setSubmittedSymbol] = useState("AAPL");
  const [range, setRange] = useState<(typeof RANGES)[number]>("6mo");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("1d");
  const [activePresetIds, setActivePresetIds] = useState<string[]>(["sma20", "rsi14", "macd"]);
  const [convertToCad, setConvertToCad] = useState(false);

  const indicators = useMemo(
    () => PRESETS.filter((p) => activePresetIds.includes(p.id)).map((p) => p.spec),
    [activePresetIds],
  );

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

  function togglePreset(id: string) {
    setActivePresetIds((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = symbolInput.trim().toUpperCase();
    if (trimmed) setSubmittedSymbol(trimmed);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("markets.title")}</CardTitle>
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
            <Button type="submit">{t("markets.load")}</Button>
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

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = activePresetIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePreset(p.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                      : "border-[var(--color-border)] text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
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
            <MarketChart candles={query.data.candles} results={query.data.results} />
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
    result.kind === "sma" || result.kind === "ema"
      ? `${result.kind.toUpperCase()} ${result.spec.period}`
      : result.kind === "rsi"
        ? `RSI ${result.spec.period}`
        : result.kind === "macd"
          ? `MACD ${result.spec.fast}/${result.spec.slow}/${result.spec.signal}`
          : `BB ${result.spec.period}/${result.spec.stdDev}`;

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
