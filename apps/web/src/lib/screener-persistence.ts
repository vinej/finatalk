const STORAGE_KEY = "finatalk:screener-workspace";
const VERSION = 2;

export type PersistedScreenerRow = {
  symbol: string;
  name: string | null;
  lastClose: number;
  rsi: number | null;
  sma50: number | null;
  sma200: number | null;
  dividendYield: number | null;
  change1d: number | null;
};

export type PersistedScreenerState = {
  v: typeof VERSION;
  source: "portfolio" | "watchlist" | "custom";
  customSymbols: string;
  priceMin: string;
  priceMax: string;
  rsiMin: string;
  rsiMax: string;
  rsiPeriod: string;
  aboveSma: string;
  belowSma: string;
  maType: "sma" | "ema";
  sortKey: "symbol" | "lastClose" | "rsi" | "sma50" | "sma200" | "change1d";
  sortDir: "asc" | "desc";
  assetTypeFilter?: "all" | "stock" | "etf" | "commodity" | "mutualfund";
  exchangeFilter?: string;
  results?: PersistedScreenerRow[];
  scannedAt?: string | null;
};

export function loadScreenerState(): PersistedScreenerState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedScreenerState;
    if (parsed?.v !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveScreenerState(state: Omit<PersistedScreenerState, "v">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, ...state }));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}
