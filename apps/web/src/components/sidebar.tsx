import { Link } from "@tanstack/react-router";
import { BookOpen, Briefcase, CalendarDays, Copy, Eye, GitCompareArrows, GraduationCap, Home, Lightbulb, LineChart, Microscope, Receipt, ScanSearch, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLastPortfolioId } from "@/lib/portfolio-persistence";

export function Sidebar() {
  const { t } = useTranslation();
  const lastPortfolioId = useLastPortfolioId();

  const portfolioLink = lastPortfolioId
    ? ({
        to: "/dashboard/portfolios/$portfolioId",
        params: { portfolioId: lastPortfolioId },
      } as const)
    : ({ to: "/dashboard/portfolios" } as const);

  const items = [
    { key: "home", to: "/dashboard", label: t("nav.home"), icon: Home },
    { key: "analysis", to: "/dashboard/analysis", label: t("nav.analysis"), icon: LineChart },
    { key: "watchlist", to: "/dashboard/watchlist", label: t("nav.watchlist"), icon: Eye },
    { key: "portfolios", label: t("nav.portfolios"), icon: Briefcase, link: portfolioLink, matchPrefix: "/dashboard/portfolios" },
    { key: "comparison", to: "/dashboard/comparison", label: t("nav.comparison"), icon: GitCompareArrows },
    { key: "screener", to: "/dashboard/screener", label: t("nav.screener"), icon: ScanSearch },
    { key: "calendar", to: "/dashboard/calendar", label: t("nav.calendar"), icon: CalendarDays },
    { key: "research", to: "/dashboard/research", label: t("nav.research"), icon: Microscope },
    { key: "tax", to: "/dashboard/tax", label: t("nav.tax"), icon: Receipt },
    { key: "templates", to: "/dashboard/templates", label: t("nav.templates"), icon: Copy },
    { key: "learn-ta", to: "/dashboard/learn-ta", label: t("nav.learnTa"), icon: BookOpen },
    { key: "learn-investment", to: "/dashboard/learn-investment", label: t("nav.learnInvestment"), icon: GraduationCap },
    { key: "strategies", to: "/dashboard/strategies", label: t("nav.strategies"), icon: Lightbulb },
    { key: "settings", to: "/dashboard/settings", label: t("nav.settings"), icon: Settings },
  ] as const;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-3 md:block">
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const linkProps =
            "link" in item
              ? item.link
              : ({ to: item.to } as const);
          return (
            <Link
              key={item.key}
              {...linkProps}
              activeOptions={{ exact: !("matchPrefix" in item) && linkProps.to === "/dashboard" }}
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
        })}
      </nav>
    </aside>
  );
}
