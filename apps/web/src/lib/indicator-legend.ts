export const CANDLE_UP = "#16a34a";
export const CANDLE_DOWN = "#dc2626";

export type IndicatorColor =
  | string
  | { kind: "macd"; line: string; signal: string; hist: string }
  | { kind: "stoch"; k: string; d: string }
  | { kind: "adx"; adx: string; pdi: string; mdi: string }
  | { kind: "maCross"; fast: string; slow: string; bull: string; bear: string }
  | { kind: "macdCross"; bull: string; bear: string }
  | { kind: "keltner"; upper: string; middle: string; lower: string }
  | { kind: "donchian"; upper: string; middle: string; lower: string }
  | { kind: "aroon"; up: string; down: string }
  | { kind: "vortex"; plus: string; minus: string }
  | { kind: "liqSweep"; highSweep: string; lowSweep: string }
  | { kind: "fvg"; bullish: string; bearish: string }
  | { kind: "srLevels"; support: string; resistance: string }
  | { kind: "pivots"; pp: string; resistance: string; support: string }
  | { kind: "volProfile"; poc: string; valueArea: string; histogram: string }
  | { kind: "orderBlock"; bullish: string; bearish: string };
