export type CommodityCategory = "energy" | "metals" | "agriculture" | "livestock" | "softs";

export type CommodityDef = {
  symbol: string;
  nameKey: string;
  unit: string;
  category: CommodityCategory;
};

export const COMMODITY_EXCHANGE_BY_CATEGORY: Record<CommodityCategory, string> = {
  energy: "NYMEX",
  metals: "COMEX",
  agriculture: "CBOT",
  livestock: "CME",
  softs: "ICE",
};

export const COMMODITIES: CommodityDef[] = [
  { symbol: "CL=F", nameKey: "commodities.name.wti", unit: "USD/bbl", category: "energy" },
  { symbol: "BZ=F", nameKey: "commodities.name.brent", unit: "USD/bbl", category: "energy" },
  { symbol: "NG=F", nameKey: "commodities.name.naturalGas", unit: "USD/MMBtu", category: "energy" },
  { symbol: "RB=F", nameKey: "commodities.name.gasoline", unit: "USD/gal", category: "energy" },
  { symbol: "HO=F", nameKey: "commodities.name.heatingOil", unit: "USD/gal", category: "energy" },

  { symbol: "GC=F", nameKey: "commodities.name.gold", unit: "USD/oz", category: "metals" },
  { symbol: "SI=F", nameKey: "commodities.name.silver", unit: "USD/oz", category: "metals" },
  { symbol: "PL=F", nameKey: "commodities.name.platinum", unit: "USD/oz", category: "metals" },
  { symbol: "PA=F", nameKey: "commodities.name.palladium", unit: "USD/oz", category: "metals" },
  { symbol: "HG=F", nameKey: "commodities.name.copper", unit: "USD/lb", category: "metals" },

  { symbol: "ZC=F", nameKey: "commodities.name.corn", unit: "¢/bu", category: "agriculture" },
  { symbol: "ZW=F", nameKey: "commodities.name.wheat", unit: "¢/bu", category: "agriculture" },
  { symbol: "ZS=F", nameKey: "commodities.name.soybeans", unit: "¢/bu", category: "agriculture" },
  { symbol: "ZO=F", nameKey: "commodities.name.oats", unit: "¢/bu", category: "agriculture" },
  { symbol: "ZR=F", nameKey: "commodities.name.rice", unit: "USD/cwt", category: "agriculture" },

  { symbol: "LE=F", nameKey: "commodities.name.liveCattle", unit: "¢/lb", category: "livestock" },
  { symbol: "HE=F", nameKey: "commodities.name.leanHogs", unit: "¢/lb", category: "livestock" },

  { symbol: "KC=F", nameKey: "commodities.name.coffee", unit: "¢/lb", category: "softs" },
  { symbol: "SB=F", nameKey: "commodities.name.sugar", unit: "¢/lb", category: "softs" },
  { symbol: "CC=F", nameKey: "commodities.name.cocoa", unit: "USD/t", category: "softs" },
  { symbol: "CT=F", nameKey: "commodities.name.cotton", unit: "¢/lb", category: "softs" },
];

export const COMMODITY_CATEGORY_ORDER: CommodityCategory[] = [
  "energy",
  "metals",
  "agriculture",
  "livestock",
  "softs",
];

export const COMMODITY_SYMBOLS = new Set(COMMODITIES.map((c) => c.symbol));
