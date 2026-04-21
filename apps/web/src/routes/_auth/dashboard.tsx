import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Database, LineChart, Loader2, Microscope, Newspaper, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AllocationDonut, colorFor, type DonutSegment } from "@/components/portfolio/allocation-donut";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ai/markdown";
import { formatCurrency, formatPct } from "@/lib/format";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { data: user } = trpc.user.me.useQuery();
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const portfolios = portfoliosQuery.data ?? [];
  const portfolioIds = portfolios.map((p) => p.id);

  const detailQueries = trpc.useQueries((t) =>
    portfolioIds.map((id) => t.portfolio.getPortfolio({ id })),
  );

  const watchlistQuery = trpc.watchlist.get.useQuery();

  const [briefing, setBriefing] = useState<string | null>(null);

  const briefingMutation = trpc.ai.generateBriefing.useMutation({
    onSuccess: (data) => setBriefing(data.briefing),
  });

  function generateBriefing() {
    const portfolioData = detailQueries
      .filter((q) => q.data)
      .map((q) => {
        const d = q.data!;
        return {
          title: d.title,
          currency: d.currency,
          holdings: d.holdings.map((h) => ({
            symbol: h.symbol,
            quantity: Number(h.quantity),
          })),
        };
      });
    const watchlistSymbols = watchlistQuery.data?.items?.map((i) => i.symbol) ?? [];
    briefingMutation.mutate({
      portfolios: portfolioData,
      watchlistSymbols,
      language: i18n.language,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{t("dashboard.welcome", { name: user?.name ?? "" })}</h1>
          <p className="text-sm text-[var(--color-muted-fg)]">{t("dashboard.subtitle")}</p>
        </div>
        <ProviderBadge />
      </div>

      {portfoliosQuery.isPending ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("portfolio.loading")}
        </div>
      ) : portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-[var(--color-muted-fg)]">{t("dashboard.noPortfolios")}</p>
            <Link
              to="/dashboard/portfolios"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              <Briefcase className="h-4 w-4" />
              {t("dashboard.createFirst")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {portfolios.map((p) => (
            <PortfolioSummaryCard key={p.id} portfolioId={p.id} title={p.title} currency={p.currency} holdingCount={p.holdingCount} />
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/dashboard/analysis" icon={LineChart} label={t("dashboard.goAnalysis")} />
        <QuickLink to="/dashboard/research" icon={Microscope} label={t("dashboard.goResearch")} />
        <QuickLink to="/dashboard/portfolios" icon={Briefcase} label={t("dashboard.goPortfolios")} />
      </div>

      {portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-[var(--color-muted-fg)]" />
                <CardTitle className="text-sm font-semibold">{t("briefing.title")}</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={generateBriefing}
                disabled={briefingMutation.isPending}
              >
                {briefingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    {t("briefing.generating")}
                  </>
                ) : (
                  t("briefing.generate")
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {briefingMutation.isError && (
              <p className="text-xs text-[#ef4444]">{t("briefing.failed")}</p>
            )}
            {briefing ? (
              <div className="space-y-2">
                <Markdown>{briefing}</Markdown>
                <p className="text-[10px] text-[var(--color-muted-fg)]">{t("briefing.disclaimer")}</p>
              </div>
            ) : !briefingMutation.isPending ? (
              <p className="py-4 text-center text-xs text-[var(--color-muted-fg)]">{t("briefing.empty")}</p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PortfolioSummaryCard({
  portfolioId,
  title,
  currency,
  holdingCount,
}: {
  portfolioId: string;
  title: string;
  currency: string;
  holdingCount: number;
}) {
  const { t } = useTranslation();
  const valuationQuery = trpc.portfolio.getValuation.useQuery(
    { id: portfolioId },
    { staleTime: 60_000, retry: false },
  );

  const totals = valuationQuery.data?.totals;
  const rows = valuationQuery.data?.rows ?? [];

  const segments: DonutSegment[] = useMemo(() => {
    const valued = rows.filter((r) => r.marketValue != null && r.marketValue > 0);
    return valued.map((r, i) => ({
      label: r.holding.symbol,
      value: r.marketValue!,
      color: colorFor(r.holding.symbol, i),
    }));
  }, [rows]);

  const topMovers = useMemo(() => {
    const withPl = rows
      .filter((r) => r.unrealizedPct != null)
      .map((r) => ({ symbol: r.holding.symbol, pct: r.unrealizedPct! }));
    withPl.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
    return withPl.slice(0, 3);
  }, [rows]);

  const plTone = totals?.unrealizedAbs == null ? "neutral" : totals.unrealizedAbs >= 0 ? "pos" : "neg";

  return (
    <Link
      to="/dashboard/portfolios/$portfolioId"
      params={{ portfolioId }}
      className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-colors hover:bg-[var(--color-accent)]/40"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="text-xs text-[var(--color-muted-fg)]">
            {t("portfolio.holdingsCount", { count: holdingCount })} · {currency}
          </span>
        </div>
        {valuationQuery.isPending && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-muted-fg)]" />}
      </div>

      {totals && (
        <div className="mt-3 flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-[var(--color-muted-fg)]">{t("dashboard.totalValue")}</p>
              <p className="text-lg font-semibold tabular-nums">{formatCurrency(totals.marketValue, currency)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted-fg)]">{t("dashboard.unrealizedPl")}</p>
              <p
                className={
                  "text-sm font-medium tabular-nums " +
                  (plTone === "pos" ? "text-[#10b981]" : plTone === "neg" ? "text-[#ef4444]" : "")
                }
              >
                {formatCurrency(totals.unrealizedAbs, currency)} ({formatPct(totals.unrealizedPct)})
              </p>
            </div>

            {topMovers.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-muted-fg)]">{t("dashboard.topMovers")}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  {topMovers.map((m) => (
                    <span key={m.symbol} className="flex items-center gap-0.5 text-xs tabular-nums">
                      <span className="font-medium">{m.symbol}</span>
                      {m.pct >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-[#10b981]" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-[#ef4444]" />
                      )}
                      <span className={m.pct >= 0 ? "text-[#10b981]" : "text-[#ef4444]"}>
                        {formatPct(m.pct)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {segments.length > 0 && (
            <div className="shrink-0">
              <AllocationDonut segments={segments} size={100} thickness={14} />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

function ProviderBadge() {
  const { t } = useTranslation();
  const { data } = trpc.market.providerStatus.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  if (!data) return null;
  const label = data.active === "openbb" ? "OpenBB Platform" : "Yahoo Finance";
  const tone = data.active === "openbb" ? "text-[#10b981]" : "text-[var(--color-muted-fg)]";
  return (
    <div className="flex shrink-0 items-center gap-1.5 pt-1 text-[11px] text-[var(--color-muted-fg)]">
      <Database className={`h-3 w-3 ${tone}`} />
      <span>{t("dashboard.poweredBy", { provider: label })}</span>
      {data.openbbEnabled && !data.openbbHealthy && (
        <span className="text-[#f59e0b]">· {t("dashboard.providerFallback")}</span>
      )}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: typeof LineChart; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-medium text-[var(--color-muted-fg)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
