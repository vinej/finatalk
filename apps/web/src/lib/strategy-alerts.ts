import type { AlertConditionType, AlertIndicatorParams } from "@finatalk/trpc/constants/alerts";
import type { StrategyKind } from "./strategy-guide";

export type AlertTemplate = {
  conditionType: AlertConditionType;
  threshold: number;
  indicatorParams: AlertIndicatorParams | null;
  rationaleKey: string;
};

export const STRATEGY_ALERT_TEMPLATES: Record<StrategyKind, AlertTemplate[]> = {
  buyAndHold: [
    { conditionType: "drawdown_from_high", threshold: 15, indicatorParams: { lookback: 252 }, rationaleKey: "dipEntry" },
  ],
  dollarCostAveraging: [
    { conditionType: "drawdown_from_high", threshold: 10, indicatorParams: { lookback: 60 }, rationaleKey: "opportunisticAdd" },
  ],
  valueInvesting: [
    { conditionType: "drawdown_from_high", threshold: 20, indicatorParams: { lookback: 252 }, rationaleKey: "marginOfSafety" },
    { conditionType: "rsi_below", threshold: 30, indicatorParams: { period: 14 }, rationaleKey: "oversoldValue" },
  ],
  growthInvesting: [
    { conditionType: "breakout_high", threshold: 0, indicatorParams: { lookback: 60 }, rationaleKey: "trendConfirmation" },
    { conditionType: "drawdown_from_high", threshold: 20, indicatorParams: { lookback: 252 }, rationaleKey: "riskExit" },
  ],
  dividendInvesting: [
    { conditionType: "drawdown_from_high", threshold: 15, indicatorParams: { lookback: 252 }, rationaleKey: "higherYieldEntry" },
  ],
  indexInvesting: [
    { conditionType: "drawdown_from_high", threshold: 10, indicatorParams: { lookback: 252 }, rationaleKey: "rebalanceAdd" },
  ],
  bondLaddering: [],
  barbellStrategy: [],
  assetAllocation: [
    { conditionType: "drawdown_from_high", threshold: 10, indicatorParams: { lookback: 252 }, rationaleKey: "rebalanceTrigger" },
  ],
  coreSatellite: [
    { conditionType: "drawdown_from_high", threshold: 10, indicatorParams: { lookback: 252 }, rationaleKey: "satelliteRotation" },
  ],
  faberTrendFilter: [
    // SMA(200) ≈ 10-month SMA on daily candles. fast=10 acts as a smoothed
    // proxy for "price" so the cross fires on a confirmed move rather than
    // a single noisy print.
    { conditionType: "ma_cross_up", threshold: 0, indicatorParams: { fast: 10, slow: 200 }, rationaleKey: "faberRegimeUp" },
    { conditionType: "ma_cross_down", threshold: 0, indicatorParams: { fast: 10, slow: 200 }, rationaleKey: "faberRegimeDown" },
  ],
  momentumInvesting: [
    { conditionType: "rsi_above", threshold: 70, indicatorParams: { period: 14 }, rationaleKey: "overheatWarning" },
    { conditionType: "breakout_high", threshold: 0, indicatorParams: { lookback: 60 }, rationaleKey: "momentumContinuation" },
    { conditionType: "pct_change_24h_up", threshold: 5, indicatorParams: null, rationaleKey: "breakoutDay" },
  ],
  contrarianInvesting: [
    { conditionType: "rsi_below", threshold: 30, indicatorParams: { period: 14 }, rationaleKey: "oversoldEntry" },
    { conditionType: "drawdown_from_high", threshold: 25, indicatorParams: { lookback: 252 }, rationaleKey: "deepValue" },
  ],
  trendPullback: [
    { conditionType: "rsi_below", threshold: 40, indicatorParams: { period: 14 }, rationaleKey: "uptrendPullback" },
    { conditionType: "rsi_above", threshold: 70, indicatorParams: { period: 14 }, rationaleKey: "exitOverbought" },
  ],
  breakoutMomentum: [
    { conditionType: "breakout_high", threshold: 0, indicatorParams: { lookback: 20 }, rationaleKey: "longBreakout" },
    { conditionType: "breakout_low", threshold: 0, indicatorParams: { lookback: 20 }, rationaleKey: "shortBreakout" },
  ],
  meanReversion: [
    { conditionType: "bb_lower_break", threshold: 0, indicatorParams: { period: 20, stdDev: 2 }, rationaleKey: "oversoldBounce" },
    { conditionType: "bb_upper_break", threshold: 0, indicatorParams: { period: 20, stdDev: 2 }, rationaleKey: "overboughtFade" },
    { conditionType: "rsi_below", threshold: 30, indicatorParams: { period: 14 }, rationaleKey: "oversold" },
    { conditionType: "rsi_above", threshold: 70, indicatorParams: { period: 14 }, rationaleKey: "overbought" },
  ],
  maCrossover: [
    { conditionType: "ma_cross_up", threshold: 0, indicatorParams: { fast: 50, slow: 200 }, rationaleKey: "goldenCross" },
    { conditionType: "ma_cross_down", threshold: 0, indicatorParams: { fast: 50, slow: 200 }, rationaleKey: "deathCross" },
  ],
  supportResistancePullback: [
    { conditionType: "drawdown_from_high", threshold: 5, indicatorParams: { lookback: 60 }, rationaleKey: "approachSupport" },
    { conditionType: "rsi_below", threshold: 40, indicatorParams: { period: 14 }, rationaleKey: "pullbackBuy" },
  ],
  openingRangeBreakout: [],
  vwapStrategy: [],
  volumeProfileRotation: [],
  orderBlockRetest: [],
  pivotPointReaction: [],
  liqSweepReversal: [],
  donchianTurtleBreakout: [
    { conditionType: "breakout_high", threshold: 0, indicatorParams: { lookback: 20 }, rationaleKey: "system1Long" },
    { conditionType: "breakout_low", threshold: 0, indicatorParams: { lookback: 10 }, rationaleKey: "system1Exit" },
    { conditionType: "breakout_high", threshold: 0, indicatorParams: { lookback: 55 }, rationaleKey: "system2Long" },
    { conditionType: "breakout_low", threshold: 0, indicatorParams: { lookback: 55 }, rationaleKey: "system2Short" },
  ],
  trendStructureVolatility: [
    { conditionType: "ma_cross_up", threshold: 0, indicatorParams: { fast: 50, slow: 200 }, rationaleKey: "regimeUp" },
    { conditionType: "ma_cross_down", threshold: 0, indicatorParams: { fast: 50, slow: 200 }, rationaleKey: "regimeDown" },
    { conditionType: "adx_above", threshold: 25, indicatorParams: { period: 14 }, rationaleKey: "trendActivation" },
    { conditionType: "rsi_above", threshold: 70, indicatorParams: { period: 14 }, rationaleKey: "exitLong" },
    { conditionType: "rsi_below", threshold: 30, indicatorParams: { period: 14 }, rationaleKey: "exitShort" },
  ],
};

export function isStrategySupported(kind: StrategyKind): boolean {
  return STRATEGY_ALERT_TEMPLATES[kind].length > 0;
}
