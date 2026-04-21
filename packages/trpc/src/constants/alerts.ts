export const ALERT_CONDITIONS = [
  "price_above",
  "price_below",
  "pct_change_24h_up",
  "pct_change_24h_down",
  "ma_cross_up",
  "ma_cross_down",
  "rsi_above",
  "rsi_below",
  "breakout_high",
  "breakout_low",
  "bb_upper_break",
  "bb_lower_break",
  "macd_cross_up",
  "macd_cross_down",
  "adx_above",
  "drawdown_from_high",
  "volume_spike",
] as const;

export type AlertConditionType = (typeof ALERT_CONDITIONS)[number];

export type AlertIndicatorParams = {
  fast?: number;
  slow?: number;
  signal?: number;
  period?: number;
  stdDev?: number;
  lookback?: number;
};

export type AlertThresholdKind = "price" | "pct" | "rsi" | "adx" | "multiplier" | "none";

export function thresholdKind(c: AlertConditionType): AlertThresholdKind {
  switch (c) {
    case "price_above":
    case "price_below":
      return "price";
    case "pct_change_24h_up":
    case "pct_change_24h_down":
    case "drawdown_from_high":
      return "pct";
    case "rsi_above":
    case "rsi_below":
      return "rsi";
    case "adx_above":
      return "adx";
    case "volume_spike":
      return "multiplier";
    default:
      return "none";
  }
}

export function paramShape(c: AlertConditionType): {
  fast?: boolean;
  slow?: boolean;
  signal?: boolean;
  period?: boolean;
  stdDev?: boolean;
  lookback?: boolean;
} {
  switch (c) {
    case "ma_cross_up":
    case "ma_cross_down":
      return { fast: true, slow: true };
    case "rsi_above":
    case "rsi_below":
    case "adx_above":
      return { period: true };
    case "bb_upper_break":
    case "bb_lower_break":
      return { period: true, stdDev: true };
    case "macd_cross_up":
    case "macd_cross_down":
      return { fast: true, slow: true, signal: true };
    case "breakout_high":
    case "breakout_low":
    case "drawdown_from_high":
      return { lookback: true };
    case "volume_spike":
      return { period: true };
    default:
      return {};
  }
}
