import { Link } from "@tanstack/react-router";
import { ArrowUpDown, BookOpen, Briefcase, CalendarDays, ChevronDown, ChevronRight, Coins, Copy, Eye, GitCompareArrows, GraduationCap, Home, Landmark, Lightbulb, LineChart, Microscope, Newspaper, NotebookPen, Percent, PercentCircle, Receipt, ScanSearch, Settings, Sparkles, Wheat } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLastPortfolioId } from "@/lib/portfolio-persistence";
import { trpc } from "@/lib/trpc";

const LEARNING_COLLAPSED_KEY = "finatalk:sidebar-learning-collapsed";
const SYMBOLS_COLLAPSED_KEY = "finatalk:sidebar-symbols-collapsed";

export function Sidebar() {
  const { t } = useTranslation();
  const lastPortfolioId = useLastPortfolioId();
  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const showTax = portfoliosQuery.data?.some((p) => p.manageTransactions) ?? false;

  const [learningCollapsed, setLearningCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(LEARNING_COLLAPSED_KEY) === "1";
  });

  const [symbolsCollapsed, setSymbolsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SYMBOLS_COLLAPSED_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LEARNING_COLLAPSED_KEY, learningCollapsed ? "1" : "0");
  }, [learningCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SYMBOLS_COLLAPSED_KEY, symbolsCollapsed ? "1" : "0");
  }, [symbolsCollapsed]);

  const portfolioLink = lastPortfolioId
    ? ({
        to: "/dashboard/portfolios/$portfolioId",
        params: { portfolioId: lastPortfolioId },
      } as const)
    : ({ to: "/dashboard/portfolios" } as const);

  const topItems = [
    { key: "home", to: "/dashboard", label: t("nav.home"), icon: Home },
    { key: "analysis", to: "/dashboard/analysis", label: t("nav.analysis"), icon: LineChart },
    { key: "portfolios", label: t("nav.portfolios"), icon: Briefcase, link: portfolioLink, matchPrefix: "/dashboard/portfolios" },
    { key: "indices", to: "/dashboard/indices", label: t("nav.indices"), icon: Landmark },
    { key: "commodities", to: "/dashboard/commodities", label: t("nav.commodities"), icon: Wheat },
    { key: "rates", to: "/dashboard/rates", label: t("nav.rates"), icon: Percent },
    { key: "calendar", to: "/dashboard/calendar", label: t("nav.calendar"), icon: CalendarDays },
    { key: "news", to: "/dashboard/news", label: t("nav.news"), icon: Newspaper },
    { key: "research", to: "/dashboard/research", label: t("nav.research"), icon: Microscope },
    { key: "advisor", to: "/dashboard/advisor", label: t("nav.advisor"), icon: Sparkles },
    ...(showTax
      ? [{ key: "tax", to: "/dashboard/tax", label: t("nav.tax"), icon: Receipt } as const]
      : []),
    { key: "templates", to: "/dashboard/templates", label: t("nav.templates"), icon: Copy },
  ] as const;

  const symbolsItems = [
    { key: "watchlist", to: "/dashboard/watchlist", label: t("nav.watchlist"), icon: Eye },
    { key: "comparison", to: "/dashboard/comparison", label: t("nav.comparison"), icon: GitCompareArrows },
    { key: "screener", to: "/dashboard/screener", label: t("nav.screener"), icon: ScanSearch },
  ] as const;

  const learningItems = [
    { key: "learn-ta", to: "/dashboard/learn-ta", label: t("nav.learnTa"), icon: BookOpen },
    { key: "learn-buy-sell", to: "/dashboard/learn-buy-sell", label: t("nav.learnBuySell"), icon: ArrowUpDown },
    { key: "learn-investment", to: "/dashboard/learn-investment", label: t("nav.learnInvestment"), icon: GraduationCap },
    { key: "learn-rates", to: "/dashboard/learn-rates", label: t("nav.learnRates"), icon: PercentCircle },
    { key: "learn-fees", to: "/dashboard/learn-fees", label: t("nav.learnFees"), icon: Coins },
    { key: "strategies", to: "/dashboard/strategies", label: t("nav.strategies"), icon: Lightbulb },
    { key: "my-learning", to: "/dashboard/my-learning", label: t("nav.myLearning"), icon: NotebookPen },
  ] as const;

  const settingsItem = { key: "settings", to: "/dashboard/settings", label: t("nav.settings"), icon: Settings } as const;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-3 md:block">
      <nav className="flex flex-col gap-1">
        {topItems.map((item) => (
          <SidebarLink key={item.key} item={item} />
        ))}

        <button
          type="button"
          onClick={() => setSymbolsCollapsed((c) => !c)}
          className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]"
          aria-expanded={!symbolsCollapsed}
        >
          {symbolsCollapsed ? (
            <ChevronRight className="h-3 w-3" aria-hidden />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden />
          )}
          <span>{t("nav.symbols")}</span>
        </button>
        {!symbolsCollapsed && symbolsItems.map((item) => (
          <SidebarLink key={item.key} item={item} />
        ))}

        <button
          type="button"
          onClick={() => setLearningCollapsed((c) => !c)}
          className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]"
          aria-expanded={!learningCollapsed}
        >
          {learningCollapsed ? (
            <ChevronRight className="h-3 w-3" aria-hidden />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden />
          )}
          <span>{t("nav.learning")}</span>
        </button>
        {!learningCollapsed && learningItems.map((item) => (
          <SidebarLink key={item.key} item={item} />
        ))}

        <div className="mt-2">
          <SidebarLink item={settingsItem} />
        </div>
      </nav>
    </aside>
  );
}

type SidebarItem =
  | { key: string; to: string; label: string; icon: typeof Home; matchPrefix?: string }
  | { key: string; label: string; icon: typeof Home; link: { to: string; params?: Record<string, string> }; matchPrefix?: string };

function SidebarLink({ item }: { item: SidebarItem }) {
  const linkProps =
    "link" in item
      ? item.link
      : ({ to: item.to } as const);
  return (
    <Link
      {...linkProps}
      activeOptions={{ exact: !("matchPrefix" in item && item.matchPrefix) && linkProps.to === "/dashboard" }}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]",
      )}
      activeProps={{
        className: "bg-[var(--color-accent)] text-[var(--color-fg)]",
      }}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}
