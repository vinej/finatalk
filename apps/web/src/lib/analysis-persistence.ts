import type { ActiveIndicator } from "@/lib/indicator-defaults";
import type { StrategyKind } from "@/lib/strategy-guide";
import { createVersionedStorage } from "@/lib/versioned-storage";

export type PersistedAnalysisState = {
  symbolInput: string;
  submittedSymbol: string;
  range: "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "3y" | "4y" | "5y" | "10y" | "max";
  interval: "1m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1d" | "1wk" | "1mo";
  convertToCad: boolean;
  activeIndicators: ActiveIndicator[];
  hiddenIds: string[];
  loadedAnalysisId: string | null;
  loadedAnalysisTitle: string | null;
  loadedAnalysisDescription: string | null;
  controlsCollapsed?: boolean;
  indicatorsCollapsed?: boolean;
  latestCollapsed?: boolean;
  etfCollapsed?: boolean;
  analystCollapsed?: boolean;
  ownershipCollapsed?: boolean;
  shortInterestCollapsed?: boolean;
  assetTypeFilter?: "all" | "stock" | "etf" | "commodity" | "mutualfund" | "crypto" | "index";
  exchangeFilter?: string;
  appliedStrategy?: StrategyKind | null;
};

const store = createVersionedStorage<PersistedAnalysisState>("finatalk:analysis-workspace", 1);

export const loadAnalysisState = store.load;
export const saveAnalysisState = store.save;
