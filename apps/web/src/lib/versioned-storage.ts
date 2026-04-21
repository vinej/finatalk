export function createVersionedStorage<T extends object>(key: string, version: number) {
  function load(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as T & { v?: number };
      if (parsed?.v !== version) return null;
      const { v: _v, ...rest } = parsed;
      return rest as T;
    } catch {
      return null;
    }
  }
  function save(state: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify({ v: version, ...state }));
    } catch {
      /* quota exceeded or disabled — ignore */
    }
  }
  return { load, save };
}
