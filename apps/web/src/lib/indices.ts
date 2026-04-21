export type IndexKey = "sp500" | "nasdaq" | "dowjones" | "tsx" | "tsx60";

export type IndexDef = {
  key: IndexKey;
  labelKey: string;
  description: string;
  yahooSymbol: string;
};

export const INDICES: IndexDef[] = [
  { key: "sp500", labelKey: "indices.sp500", description: "S&P 500", yahooSymbol: "^GSPC" },
  { key: "nasdaq", labelKey: "indices.nasdaq", description: "Nasdaq 100", yahooSymbol: "^NDX" },
  { key: "dowjones", labelKey: "indices.dowjones", description: "Dow Jones 30", yahooSymbol: "^DJI" },
  { key: "tsx", labelKey: "indices.tsx", description: "S&P/TSX Composite", yahooSymbol: "^GSPTSE" },
  { key: "tsx60", labelKey: "indices.tsx60", description: "S&P/TSX 60", yahooSymbol: "XIU.TO" },
];

export const INDEX_SYMBOLS = new Set(INDICES.map((i) => i.yahooSymbol));
