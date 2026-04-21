const DASH = "—";

export function formatPct(
  value: number | null | undefined,
  opts: { signed?: boolean; autoScale?: boolean; digits?: number } = {},
): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  const { signed = true, autoScale = false, digits = 2 } = opts;
  const v = autoScale && Math.abs(value) <= 1 ? value * 100 : value;
  const sign = signed && v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

export function formatCurrency(
  value: number | null | undefined,
  currency: string | null | undefined = "USD",
  opts: { digits?: number; compact?: boolean } = {},
): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  const ccy = currency ?? "USD";
  const { digits = 2, compact = false } = opts;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: digits,
      notation: compact && Math.abs(value) >= 1_000_000 ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${ccy} ${value.toLocaleString()}`;
  }
}

// Tiered price formatter — wider precision for small values.
export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toPrecision(4);
}

// K / M / B suffixes. Used for volume and other large counts.
export function formatCompactNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return DASH;
  if (value >= 1e9) return (value / 1e9).toFixed(digits) + "B";
  if (value >= 1e6) return (value / 1e6).toFixed(digits) + "M";
  if (value >= 1e3) return (value / 1e3).toFixed(digits) + "K";
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatQty(value: number | null | undefined, maxDigits = 8): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  return value.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}

export function formatNum(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  return value.toFixed(digits);
}

export function formatShares(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return DASH;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH;
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function formatDateIso(t: number | null | undefined): string {
  if (t == null || !Number.isFinite(t)) return DASH;
  try {
    return new Date(t).toISOString().slice(0, 10);
  } catch {
    return DASH;
  }
}
