import type { ActiveIndicator } from "@/lib/indicator-defaults";

const STORAGE_KEY = "finatalk:analysis-workspace";
const VERSION = 1;

export type PersistedAnalysisState = {
  v: typeof VERSION;
  symbolInput: string;
  submittedSymbol: string;
  range: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max";
  interval: "1d" | "1wk" | "1mo";
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
  assetTypeFilter?: "all" | "stock" | "etf";
  exchangeFilter?: string;
};

export function loadAnalysisState(): PersistedAnalysisState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAnalysisState;
    if (parsed?.v !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAnalysisState(state: Omit<PersistedAnalysisState, "v">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, ...state }));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}
