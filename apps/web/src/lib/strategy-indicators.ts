import type { IndicatorKind } from "@/lib/indicator-defaults";
import type { StrategyKind } from "@/lib/strategy-guide";

export const STRATEGY_CHART_INDICATORS: Partial<Record<StrategyKind, IndicatorKind[]>> = {
  trendPullback: ["ema", "rsi", "vwap", "keltner", "aroon", "vortex", "tii"],
  breakoutMomentum: ["donchian", "volOsc", "ad", "cmf", "chaikinVol", "atr", "rsi", "macd", "srLevels"],
  meanReversion: ["rsi", "bbands", "bbPctB", "zscore", "keltner", "adx", "hurst", "sma"],
  maCrossover: ["maCross", "aroon", "vortex", "tii"],
  supportResistancePullback: ["srLevels", "ema"],
  openingRangeBreakout: ["atr"],
  vwapStrategy: ["vwap", "rsi", "macd"],
  volumeProfileRotation: ["volProfile", "adx", "rsi"],
  orderBlockRetest: ["orderBlock", "ema", "liqSweep", "fvg", "atr"],
  pivotPointReaction: ["pivots", "adx"],
  liqSweepReversal: ["liqSweep", "orderBlock", "fvg", "adx"],
  donchianTurtleBreakout: ["donchian", "atr"],
  trendStructureVolatility: ["ema", "adx", "rsi", "atr", "keltner", "vwap", "volProfile"],
};

export function strategyChartIndicators(kind: StrategyKind): IndicatorKind[] {
  return STRATEGY_CHART_INDICATORS[kind] ?? [];
}
