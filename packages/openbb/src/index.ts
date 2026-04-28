/**
 * @fileoverview OpenBB client package entry.
 *
 * Re-exports `OpenBBClient`, `OpenBBError`, and every result/options type so
 * consumers (packages/trpc/src/lib/market-provider.ts, the alert evaluator,
 * Mastra tools) don't reach into ./client or ./types directly.
 *
 * `getOpenBBClient()` is a lazy singleton — instantiated on first use so
 * apps that never enable OpenBB don't pay any cost.
 *
 * `isOpenBBEnabled()` is the gate the rest of the codebase uses before
 * touching the sidecar; returns false when OPENBB_BASE_URL is unset or
 * OPENBB_ENABLED=false.
 */
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
  IndexConstituent,
  AnalystConsensus,
  PriceTarget,
  InsiderTrade,
  InstitutionalHolder,
  ShortInterestRecord,
  YieldCurvePoint,
  YieldCurveOpts,
  CentralBankRatePoint,
  CentralBankRateOpts,
  TreasurySpreadOpts,
  OecdInterestRatePoint,
  OecdInterestRateOpts,
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
