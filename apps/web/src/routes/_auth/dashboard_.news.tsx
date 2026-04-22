import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Globe2, Loader2, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { safeExternalUrl } from "@/lib/safe-url";
import { trpc } from "@/lib/trpc";
import type { RouterOutputs } from "@finatalk/trpc";

export const Route = createFileRoute("/_auth/dashboard_/news")({
  component: NewsPage,
});

type Tab = "world" | "mine" | "symbol";
type NewsArticle = RouterOutputs["news"]["getWorldNews"][number];

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d`;
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

function NewsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("world");
  const [symbolInput, setSymbolInput] = useState("");
  const [submittedSymbol, setSubmittedSymbol] = useState("");

  const watchlistQuery = trpc.watchlist.get.useQuery(undefined, {
    enabled: tab === "mine",
  });
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery(undefined, {
    enabled: tab === "mine",
  });
  const portfolioIds = portfoliosQuery.data?.map((p) => p.id) ?? [];
  const portfolioDetails = trpc.useQueries((tq) =>
    portfolioIds.map((id) => tq.portfolio.getPortfolio({ id })),
  );

  const mySymbols = useMemo(() => {
    const set = new Set<string>();
    if (tab !== "mine") return [];
    for (const w of watchlistQuery.data?.items ?? []) set.add(w.symbol);
    for (const q of portfolioDetails) {
      for (const h of q.data?.holdings ?? []) set.add(h.symbol);
    }
    return [...set].slice(0, 30);
  }, [tab, watchlistQuery.data, portfolioDetails]);

  const worldQuery = trpc.news.getWorldNews.useQuery(
    { limit: 50 },
    { enabled: tab === "world", staleTime: 5 * 60_000 },
  );

  const myNewsQuery = trpc.news.getMyNews.useQuery(
    { symbols: mySymbols, perSymbolLimit: 5 },
    { enabled: tab === "mine" && mySymbols.length > 0, staleTime: 5 * 60_000 },
  );

  const symbolQuery = trpc.news.getCompanyNews.useQuery(
    { symbol: submittedSymbol, limit: 50 },
    { enabled: tab === "symbol" && submittedSymbol.length > 0, staleTime: 5 * 60_000 },
  );

  function onSymbolSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = symbolInput.trim().toUpperCase();
    if (s) setSubmittedSymbol(s);
  }

  const activeQuery = tab === "world" ? worldQuery : tab === "mine" ? myNewsQuery : symbolQuery;
  const articles: NewsArticle[] = activeQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("news.title")}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("news.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-2">
        <TabButton active={tab === "world"} onClick={() => setTab("world")} icon={<Globe2 className="h-3.5 w-3.5" />}>
          {t("news.tabWorld")}
        </TabButton>
        <TabButton active={tab === "mine"} onClick={() => setTab("mine")} icon={<User className="h-3.5 w-3.5" />}>
          {t("news.tabMine")}
        </TabButton>
        <TabButton active={tab === "symbol"} onClick={() => setTab("symbol")} icon={<Search className="h-3.5 w-3.5" />}>
          {t("news.tabSymbol")}
        </TabButton>
      </div>

      {tab === "symbol" && (
        <form onSubmit={onSymbolSubmit} className="flex items-center gap-2">
          <Input
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            placeholder="AAPL, MSFT, TSLA…"
            className="w-48"
          />
          <Button type="submit" size="sm">{t("news.search")}</Button>
          {submittedSymbol && (
            <span className="text-xs text-[var(--color-muted-fg)]">
              {t("news.showing", { symbol: submittedSymbol })}
            </span>
          )}
        </form>
      )}

      {tab === "mine" && mySymbols.length === 0 && !watchlistQuery.isPending && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-[var(--color-muted-fg)]">
            {t("news.noSymbols")}
          </CardContent>
        </Card>
      )}

      {activeQuery.isPending && (tab !== "symbol" || submittedSymbol) && (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("news.loading")}
        </div>
      )}

      {!activeQuery.isPending && articles.length === 0 && (tab !== "symbol" || submittedSymbol) && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-[var(--color-muted-fg)]">
            {t("news.empty")}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {articles.map((a, i) => (
          <ArticleCard key={`${a.url}-${i}`} article={a} />
        ))}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-[var(--color-accent)] font-semibold text-[var(--color-fg)]"
          : "text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]/40")
      }
    >
      {icon}
      {children}
    </button>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const safeUrl = safeExternalUrl(article.url);
  const safeImageUrl = safeExternalUrl(article.imageUrl);
  if (!safeUrl) return null;
  return (
    <Card>
      <CardContent className="flex gap-3 p-3">
        {safeImageUrl && (
          <img
            src={safeImageUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <div className="min-w-0 flex-1">
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-start gap-1 text-sm font-medium text-[var(--color-fg)] hover:text-[var(--color-primary)]"
          >
            <span className="line-clamp-2">{article.title}</span>
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          {article.summary && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted-fg)]">{article.summary}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-muted-fg)]">
            {article.source && <span className="font-medium">{article.source}</span>}
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            {article.symbols.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.symbols.slice(0, 5).map((s) => (
                  <span key={s} className="rounded bg-[var(--color-accent)] px-1.5 py-0.5 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
