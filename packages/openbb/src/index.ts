import { OpenBBClient } from "./client";

export { OpenBBClient } from "./client";
export { OpenBBError } from "./errors";
export type {
  OHLCVBar,
  Quote,
  DividendRecord,
  EarningsEvent,
  CompanyProfile,
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  OptionContract,
  OptionsChain,
  EconomicDataPoint,
  FredDataPoint,
  SearchResult,
  EtfInfo,
  EtfHolding,
  EtfSectorWeight,
  EtfCountryWeight,
  NewsArticle,
  NewsOpts,
  HistoricalPriceOpts,
  FundamentalOpts,
  DividendOpts,
  OptionsChainOpts,
  EconomicIndicatorOpts,
  FredOpts,
} from "./types";

let _client: OpenBBClient | null = null;

export function getOpenBBClient(): OpenBBClient {
  if (!_client) _client = new OpenBBClient();
  return _client;
}

export function isOpenBBEnabled(): boolean {
  return process.env.OPENBB_ENABLED !== "false" && !!process.env.OPENBB_BASE_URL;
}
