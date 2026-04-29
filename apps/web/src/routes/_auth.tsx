import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { RouteLoadingBar } from "@/components/route-loading-bar";
import { Sidebar } from "@/components/sidebar";
import { getCachedSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const session = await getCachedSession();
    if (!session.data?.user) throw redirect({ to: "/login" });
    return { user: session.data.user };
  },
  component: AuthLayout,
});

const SIDEBAR_OPEN_KEY = "finatalk:sidebar-open";

function defaultSidebarOpen(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
  if (stored !== null) return stored === "1";
  // First visit: open on desktop, closed on mobile (md = 768px in Tailwind v4).
  return window.matchMedia("(min-width: 768px)").matches;
}

function AuthLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(defaultSidebarOpen);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? "1" : "0");
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen flex-col">
      <RouteLoadingBar />
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className={cn(
            "flex-1 overflow-auto p-6 transition-[margin-left] duration-200",
            sidebarOpen ? "md:ml-56" : "md:ml-0",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
