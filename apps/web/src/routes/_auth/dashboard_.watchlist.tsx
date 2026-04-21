import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Loader2, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymbolPicker, type AssetTypeFilter } from "@/components/symbol-picker";
import { trpc } from "@/lib/trpc";

const SYMBOL_RE = /^[A-Z0-9.\-=^]+$/;

export const Route = createFileRoute("/_auth/dashboard_/watchlist")({
  component: WatchlistPage,
});

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function WatchlistPage() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const watchlistQuery = trpc.watchlist.get.useQuery();
  const items = watchlistQuery.data?.items ?? [];
  const symbols = useMemo(() => items.map((i) => i.symbol), [items]);

  const quotesQuery = trpc.watchlist.getQuotes.useQuery(
    { symbols },
    { enabled: symbols.length > 0, staleTime: 60_000 },
  );
  const quotes = useMemo(() => {
    const m = new Map<string, { lastClose: number | null; prevClose: number | null }>();
    for (const q of quotesQuery.data ?? []) m.set(q.symbol, q);
    return m;
  }, [quotesQuery.data]);

  const symbolsQuery = trpc.market.symbols.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
  const symbolNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of symbolsQuery.data?.symbols ?? []) m.set(s.symbol, s.name);
    return m;
  }, [symbolsQuery.data]);

  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [exchangeFilter, setExchangeFilter] = useState<string>("all");
  const [newSymbol, setNewSymbol] = useState("");

  const addItem = trpc.watchlist.addItem.useMutation({
    onSuccess: () => {
      void utils.watchlist.get.invalidate();
      setNewSymbol("");
      toast.success(t("watchlist.added"));
    },
    onError: (e) => {
      if (e.data?.code === "CONFLICT") toast.error(t("watchlist.duplicate"));
      else toast.error(e.message);
    },
  });
  const removeItem = trpc.watchlist.removeItem.useMutation({
    onSuccess: () => {
      void utils.watchlist.get.invalidate();
      toast.success(t("watchlist.removed"));
    },
    onError: (e) => toast.error(e.message),
  });

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const sym = newSymbol.trim().toUpperCase();
    if (!sym) return;
    if (!SYMBOL_RE.test(sym)) {
      toast.error(t("analysis.pickFromList"));
      return;
    }
    addItem.mutate({ symbol: sym });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold">{t("watchlist.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t("watchlist.symbols")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitAdd} className="mb-4 flex flex-wrap items-end gap-3">
            <SymbolPicker
              inputId="wl-symbol"
              listId="wl-symbol-suggestions"
              value={newSymbol}
              onChange={setNewSymbol}
              placeholder="AAPL"
              maxLength={20}
              inputClassName="h-8 w-40 uppercase"
              assetTypeFilter={assetTypeFilter}
              onAssetTypeChange={setAssetTypeFilter}
              exchangeFilter={exchangeFilter}
              onExchangeChange={setExchangeFilter}
            />
            <Button type="submit" size="sm" disabled={addItem.isPending || !newSymbol.trim()}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("watchlist.add")}
            </Button>
          </form>

          {items.length === 0 ? (
            <p className="py-4 text-center text-xs text-[var(--color-muted-fg)]">{t("watchlist.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-fg)]">
                    <th className="px-2 py-2 font-medium">{t("watchlist.symbolCol")}</th>
                    <th className="px-2 py-2 font-medium">{t("watchlist.name")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("watchlist.price")}</th>
                    <th className="px-2 py-2 text-right font-medium">{t("watchlist.change")}</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const q = quotes.get(item.symbol);
                    const lastClose = q?.lastClose;
                    const prevClose = q?.prevClose;
                    const change = lastClose != null && prevClose != null && prevClose > 0
                      ? ((lastClose - prevClose) / prevClose) * 100
                      : null;
                    return (
                      <tr key={item.id} className="border-b border-[var(--color-border)]">
                        <td className="px-2 py-2">
                          <Link
                            to="/dashboard/analysis"
                            search={{ symbol: item.symbol }}
                            className="font-medium text-[var(--color-primary)] hover:underline"
                          >
                            {item.symbol}
                          </Link>
                        </td>
                        <td className="px-2 py-2 text-xs text-[var(--color-muted-fg)]">
                          {symbolNameMap.get(item.symbol) ?? "—"}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {quotesQuery.isPending ? (
                            <Loader2 className="ml-auto h-3 w-3 animate-spin text-[var(--color-muted-fg)]" />
                          ) : lastClose != null ? (
                            formatCurrency(lastClose)
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {change != null ? (
                            <span className={"flex items-center justify-end gap-0.5 " + (change >= 0 ? "text-[#10b981]" : "text-[#ef4444]")}>
                              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {formatPct(change)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild size="sm" variant="ghost" title={t("watchlist.createAlert")}>
                              <Link to="/dashboard/alerts" search={{ symbol: item.symbol }}>
                                <Bell className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t("watchlist.removeSymbol")}
                              onClick={() => removeItem.mutate({ id: item.id })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
