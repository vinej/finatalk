export const CANDLE_UP = "#16a34a";
export const CANDLE_DOWN = "#dc2626";

export type IndicatorColor =
  | string
  | { kind: "macd"; line: string; signal: string; hist: string }
  | { kind: "stoch"; k: string; d: string }
  | { kind: "adx"; adx: string; pdi: string; mdi: string };
