import { Link } from "@tanstack/react-router";
import { BookOpen, Home, LineChart, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t } = useTranslation();
  const items = [
    { to: "/dashboard", label: t("nav.home"), icon: Home },
    { to: "/dashboard/markets", label: t("nav.markets"), icon: LineChart },
    { to: "/dashboard/learn-ta", label: t("nav.learnTa"), icon: BookOpen },
    { to: "/dashboard/settings", label: t("nav.settings"), icon: Settings },
  ] as const;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] p-3 md:block">
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/dashboard" }}
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
        ))}
      </nav>
    </aside>
  );
}
