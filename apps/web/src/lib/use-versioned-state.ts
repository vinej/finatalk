/**
 * @fileoverview Versioned, debounced localStorage React hook.
 *
 * Drop-in replacement for useState that persists to localStorage under `key`
 * and tags the payload with `version`. Bumping `version` force-resets the
 * stored state on the next load — used when the shape changes incompatibly
 * (analyses, portfolio drafts, comparisons, backtest configs, screener
 * filters all use this).
 *
 * Writes are debounced by `debounceMs` (default 300 ms) so rapid edits don't
 * thrash localStorage, and the timer is cleared on unmount.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createVersionedStorage } from "@/lib/versioned-storage";

export function useVersionedState<T extends object>(
  key: string,
  version: number,
  defaultValue: T | (() => T),
  debounceMs = 300,
): [T, (updater: T | ((prev: T) => T)) => void] {
  const store = useMemo(() => createVersionedStorage<T>(key, version), [key, version]);
  const [state, setState] = useState<T>(() => {
    const loaded = store.load();
    if (loaded) return loaded;
    return typeof defaultValue === "function" ? (defaultValue as () => T)() : defaultValue;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => store.save(state), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, store, debounceMs]);
  return [state, setState];
}
