export const SYMBOL_RE = /^[A-Z0-9.\-=^]+$/;

export function sanitizeSymbol(s: string | null | undefined): string {
  if (!s) return "";
  const u = s.trim().toUpperCase();
  return SYMBOL_RE.test(u) ? u : "";
}

export function sortBySymbol<T extends { symbol: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function filterByAssetType<T extends { assetType?: string | null }>(
  items: readonly T[],
  assetType: string | "all" | null | undefined,
): T[] {
  if (!assetType || assetType === "all") return [...items];
  return items.filter((item) => item.assetType === assetType);
}
