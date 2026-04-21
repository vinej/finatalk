export const SYMBOL_RE = /^[A-Z0-9.\-=^]+$/;

export function sanitizeSymbol(s: string | null | undefined): string {
  if (!s) return "";
  const u = s.trim().toUpperCase();
  return SYMBOL_RE.test(u) ? u : "";
}
