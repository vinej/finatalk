import { createVersionedStorage } from "@/lib/versioned-storage";

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
  assetTypeFilter?: "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
  exchangeFilter?: string;
  results?: PersistedScreenerRow[];
  scannedAt?: string | null;
};

const store = createVersionedStorage<PersistedScreenerState>("finatalk:screener-workspace", 2);

export const loadScreenerState = store.load;
export const saveScreenerState = store.save;
