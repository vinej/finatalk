const STORAGE_KEY = "finatalk:comparison-workspace";
const VERSION = 1;

export type PersistedComparisonState = {
  v: typeof VERSION;
  symbols: string[];
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
  interval: "1d" | "1wk" | "1mo";
  convertToCad: boolean;
  assetTypeFilter?: "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
  exchangeFilter?: string;
};

export function loadComparisonState(): PersistedComparisonState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedComparisonState;
    if (parsed?.v !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveComparisonState(state: Omit<PersistedComparisonState, "v">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, ...state }));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}
