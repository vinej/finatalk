export const EXCHANGE_MAP: Record<string, string> = {
  NMS: "NASDAQ",
  NGM: "NASDAQ",
  NCM: "NASDAQ",
  NAS: "NASDAQ",
  NYQ: "NYSE",
  ASE: "NYSE MKT",
  PCX: "NYSE ARCA",
  BATS: "BATS",
  IEX: "IEX",
  TOR: "TSX",
  VAN: "TSXV",
  CNQ: "CSE",
  NEO: "NEO",
};

export function normalizeExchange(raw: string | null | undefined): string {
  if (!raw) return "";
  const upper = raw.toUpperCase();
  return EXCHANGE_MAP[upper] ?? upper;
}
