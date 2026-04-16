import { useSyncExternalStore } from "react";

const KEY = "finatalk:last-portfolio-id";
const EVENT = "finatalk:last-portfolio-id-changed";

export function saveLastPortfolioId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, id);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}

export function clearLastPortfolioId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function loadLastPortfolioId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function useLastPortfolioId(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => loadLastPortfolioId(),
    () => null,
  );
}
