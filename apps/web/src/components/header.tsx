import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function Header({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  async function handleSignOut() {
    if (!window.confirm(t("auth.signOutConfirm"))) return;
    await signOut();
    void navigate({ to: "/login" });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 md:px-6">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={!!sidebarOpen}
            className="-ml-2 px-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}
        <Link to="/dashboard" className="rounded outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <LanguageSwitcher />
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t("auth.signOut")}</span>
        </Button>
      </div>
    </header>
  );
}
