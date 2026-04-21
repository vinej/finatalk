export function createBooleanFlag(key: string, defaultValue: boolean) {
  function load(): boolean {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return raw !== "false";
    } catch {
      return defaultValue;
    }
  }
  function save(value: boolean): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      /* ignore */
    }
  }
  return { load, save };
}
