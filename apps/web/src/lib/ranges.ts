export const RANGES = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y", "10y", "max"] as const;
export type RangeValue = (typeof RANGES)[number];

export const INTERVALS = ["1m", "5m", "15m", "30m", "60m", "90m", "1d", "1wk", "1mo"] as const;
export type IntervalValue = (typeof INTERVALS)[number];

export const INTRADAY_INTERVALS: readonly IntervalValue[] = ["1m", "5m", "15m", "30m", "60m", "90m"];

export function isIntradayInterval(i: IntervalValue): boolean {
  return (INTRADAY_INTERVALS as readonly string[]).includes(i);
}

export function compatibleRangesForInterval(i: IntervalValue): readonly RangeValue[] {
  if (i === "1m") return ["1d", "5d"];
  if (i === "5m" || i === "15m" || i === "30m" || i === "90m") return ["1d", "5d", "1mo"];
  if (i === "60m") return ["1d", "5d", "1mo", "3mo", "6mo", "1y"];
  return ["1mo", "3mo", "6mo", "1y", "2y", "3y", "4y", "5y", "10y", "max"];
}

export function defaultRangeForInterval(
  i: IntervalValue,
  dailyDefault: RangeValue = "6mo",
): RangeValue {
  if (i === "1m") return "5d";
  if (isIntradayInterval(i)) return i === "60m" ? "1mo" : "5d";
  return dailyDefault;
}

export function clampRangeForInterval(
  r: RangeValue,
  i: IntervalValue,
  dailyDefault: RangeValue = "6mo",
): RangeValue {
  const allowed = compatibleRangesForInterval(i);
  return allowed.includes(r) ? r : defaultRangeForInterval(i, dailyDefault);
}

// Step the range to the next/previous entry within a given allowed list (or
// `RANGES` by default). Used by chart zoom-out/zoom-in buttons to widen or
// narrow the data window. Clamps at the ends.
export function stepRange(
  current: RangeValue,
  direction: 1 | -1,
  allowed: readonly RangeValue[] = RANGES,
): RangeValue {
  const idx = allowed.indexOf(current);
  if (idx < 0) return current;
  const next = Math.max(0, Math.min(allowed.length - 1, idx + direction));
  return allowed[next]!;
}
