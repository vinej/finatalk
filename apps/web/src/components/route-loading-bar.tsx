import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

// Top-of-viewport indeterminate progress bar. Shown whenever TanStack Router
// is loading a new route (e.g. while loaders or beforeLoad checks resolve).
// On Fly.io's free tier the backend can be slow on cold start; without this,
// clicking a menu item looks frozen because nothing visually changes until
// the new route mounts.
//
// 150 ms delay before showing so instant in-cache navigations don't flash.
export function RouteLoadingBar() {
  const isLoading = useRouterState({
    select: (s) => s.status === "pending" || s.isLoading || s.isTransitioning,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
    >
      <div className="route-loading-bar h-full w-1/3 bg-[var(--color-fg)]" />
    </div>
  );
}
