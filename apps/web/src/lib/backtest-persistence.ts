import type { AssetTypeFilter } from "@/components/symbol-picker";
import type { BacktestConfig, BacktestStrategy } from "@/lib/backtest-engine";
import type { IntervalValue, RangeValue } from "@/lib/ranges";
import { createVersionedStorage } from "@/lib/versioned-storage";

export type BacktestMode = "single" | "sweep" | "adhocPortfolio" | "userPortfolio";

export type AdHocLeg = { symbol: string; weight: number };

export type PersistedBacktestState = {
  symbolInput: string;
  submittedSymbol: string;
  range: RangeValue;
  interval: IntervalValue;
  strategy: BacktestStrategy;
  config: BacktestConfig;
  assetTypeFilter?: AssetTypeFilter;
  exchangeFilter?: string;
  mode?: BacktestMode;
  portfolioSymbols?: string[];
  adhocLegs?: AdHocLeg[];
  userPortfolioId?: string | null;
};

const store = createVersionedStorage<PersistedBacktestState>("finatalk:backtest-state", 1);

export const loadBacktestState = store.load;
export const saveBacktestState = store.save;
