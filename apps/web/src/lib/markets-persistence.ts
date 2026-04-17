import type { ActiveIndicator } from "@/lib/indicator-defaults";

const STORAGE_KEY = "finatalk:markets-workspace";
const VERSION = 1;

export type PersistedMarketsState = {
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
  assetTypeFilter?: "all" | "stock" | "etf";
};

export function loadMarketsState(): PersistedMarketsState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMarketsState;
    if (parsed?.v !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMarketsState(state: Omit<PersistedMarketsState, "v">): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, ...state }));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}
