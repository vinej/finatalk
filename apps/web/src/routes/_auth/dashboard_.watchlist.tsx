import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BellOff, Loader2, Plus, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const alertsQuery = trpc.watchlist.listAlerts.useQuery();
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

  const createAlert = trpc.watchlist.createAlert.useMutation({
    onSuccess: () => {
      void utils.watchlist.listAlerts.invalidate();
      setAlertForm(null);
      toast.success(t("watchlist.alertCreated"));
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteAlert = trpc.watchlist.deleteAlert.useMutation({
    onSuccess: () => {
      void utils.watchlist.listAlerts.invalidate();
      toast.success(t("watchlist.alertDeleted"));
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleAlert = trpc.watchlist.toggleAlert.useMutation({
    onSuccess: () => void utils.watchlist.listAlerts.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [newSymbol, setNewSymbol] = useState("");
  const [alertForm, setAlertForm] = useState<{ symbol: string; conditionType: "price_above" | "price_below"; threshold: string } | null>(null);

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

  function submitAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!alertForm) return;
    const threshold = Number(alertForm.threshold);
    if (!Number.isFinite(threshold) || threshold <= 0) return;
    createAlert.mutate({
      symbol: alertForm.symbol,
      conditionType: alertForm.conditionType,
      threshold,
    });
  }

  const alerts = alertsQuery.data ?? [];

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
                            <Button
                              size="sm"
                              variant="ghost"
                              title={t("watchlist.createAlert")}
                              onClick={() => setAlertForm({ symbol: item.symbol, conditionType: "price_above", threshold: lastClose?.toFixed(2) ?? "" })}
                            >
                              <Bell className="h-3.5 w-3.5" />
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

      {alertForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t("watchlist.newAlert")} — {alertForm.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitAlert} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("watchlist.condition")}</Label>
                <select
                  value={alertForm.conditionType}
                  onChange={(e) => setAlertForm((f) => f ? { ...f, conditionType: e.target.value as "price_above" | "price_below" } : f)}
                  className="h-8 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
                >
                  <option value="price_above">{t("watchlist.priceAbove")}</option>
                  <option value="price_below">{t("watchlist.priceBelow")}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] uppercase text-[var(--color-muted-fg)]">{t("watchlist.threshold")}</Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={alertForm.threshold}
                  onChange={(e) => setAlertForm((f) => f ? { ...f, threshold: e.target.value } : f)}
                  className="h-8 w-28"
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={createAlert.isPending}>
                {t("watchlist.saveAlert")}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setAlertForm(null)}>
                <X className="mr-1 h-3.5 w-3.5" />
                {t("watchlist.cancelAlert")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">{t("watchlist.alerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded border border-[var(--color-border)] px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.symbol}</span>
                    <span className="text-xs text-[var(--color-muted-fg)]">
                      {a.conditionType === "price_above" ? t("watchlist.priceAbove") : t("watchlist.priceBelow")} {formatCurrency(a.threshold)}
                    </span>
                    {a.triggeredAt && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {t("watchlist.triggered")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      title={a.enabled ? t("watchlist.disableAlert") : t("watchlist.enableAlert")}
                      onClick={() => toggleAlert.mutate({ id: a.id, enabled: !a.enabled })}
                    >
                      {a.enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t("watchlist.deleteAlert")}
                      onClick={() => deleteAlert.mutate({ id: a.id })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
