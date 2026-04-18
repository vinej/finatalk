export type OHLCVBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Quote = {
  symbol: string;
  name: string | null;
  last: number;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  previousClose: number | null;
  marketCap: number | null;
};

export type DividendRecord = {
  exDividendDate: string | null;
  payDate: string | null;
  amount: number;
  currency: string | null;
};

export type EarningsEvent = {
  symbol: string;
  reportDate: string | null;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
};

export type CompanyProfile = {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  country: string | null;
  exchange: string | null;
  marketCap: number | null;
  employees: number | null;
  website: string | null;
  ceo: string | null;
};

export type IncomeStatement = {
  period: string;
  fiscalYear: number | null;
  revenue: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  eps: number | null;
  epsDiluted: number | null;
};

export type BalanceSheet = {
  period: string;
  fiscalYear: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;
  cashAndEquivalents: number | null;
  totalDebt: number | null;
};

export type CashFlow = {
  period: string;
  fiscalYear: number | null;
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  freeCashFlow: number | null;
  capitalExpenditure: number | null;
};

export type OptionContract = {
  strike: number;
  expiration: string;
  contractType: "call" | "put";
  lastPrice: number | null;
  bid: number | null;
  ask: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
};

export type OptionsChain = {
  symbol: string;
  expirations: string[];
  calls: OptionContract[];
  puts: OptionContract[];
};

export type EconomicDataPoint = {
  date: string;
  value: number;
  country: string | null;
};

export type FredDataPoint = {
  date: string;
  value: number;
};

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: string | null;
  assetType: string | null;
};

export type HistoricalPriceOpts = {
  startDate: string;
  endDate?: string | undefined;
  interval?: string | undefined;
  provider?: string | undefined;
};

export type FundamentalOpts = {
  period?: "annual" | "quarterly" | undefined;
  limit?: number | undefined;
  provider?: string | undefined;
};

export type DividendOpts = {
  startDate?: string | undefined;
  endDate?: string | undefined;
  provider?: string | undefined;
};

export type OptionsChainOpts = {
  expiration?: string | undefined;
  provider?: string | undefined;
};

export type EconomicIndicatorOpts = {
  country?: string | undefined;
  indicator?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  provider?: string | undefined;
};

export type FredOpts = {
  startDate?: string | undefined;
  endDate?: string | undefined;
  provider?: string | undefined;
};

export type EtfInfo = {
  symbol: string;
  name: string;
  description: string | null;
  inceptionDate: string | null;
  expenseRatio: number | null;
  aum: number | null;
  nav: number | null;
  yield: number | null;
  category: string | null;
  issuer: string | null;
  currency: string | null;
};

export type EtfHolding = {
  symbol: string | null;
  name: string;
  weight: number | null;
  shares: number | null;
  marketValue: number | null;
};

export type EtfSectorWeight = {
  sector: string;
  weight: number;
};

export type EtfCountryWeight = {
  country: string;
  weight: number;
};

export type NewsArticle = {
  title: string;
  url: string;
  publishedAt: string | null;
  source: string | null;
  author: string | null;
  summary: string | null;
  imageUrl: string | null;
  symbols: string[];
};

export type NewsOpts = {
  limit?: number | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  provider?: string | undefined;
};
