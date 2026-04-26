import { createVersionedStorage } from "@/lib/versioned-storage";

export type PersistedComparisonState = {
  symbols: string[];
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "max";
  interval: "1d" | "1wk" | "1mo";
  convertToCad: boolean;
  assetTypeFilter?: "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
  exchangeFilter?: string;
};

const store = createVersionedStorage<PersistedComparisonState>("finatalk:comparison-workspace", 1);

export const loadComparisonState = store.load;
export const saveComparisonState = store.save;
