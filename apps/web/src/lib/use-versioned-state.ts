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
