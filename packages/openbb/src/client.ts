/**
 * @fileoverview Typed REST client for the OpenBB Platform sidecar.
 *
 * `OpenBBClient` issues HTTP requests against `${OPENBB_BASE_URL}/api/v1/...`
 * and maps each provider's snake_case payload to the camelCase TypeScript
 * shapes declared in ./types. The sidecar itself (services/openbb/) wraps
 * OpenBB Core and is configured with provider credentials (FMP, FRED, Benzinga,
 * Yahoo, …) at startup.
 *
 * Conventions:
 *   - Every endpoint goes through `request<T>` which:
 *       • appends query params (omitting `undefined`s),
 *       • aborts after `timeoutMs` (default 30 s),
 *       • throws OpenBBError on non-2xx with status + body excerpt,
 *       • unwraps `{ results: [...] }` when present.
 *   - Each method picks a sensible default `provider`. Override via the
 *     `provider` option when you specifically need another upstream.
 *   - Numeric coercion is defensive (Number(... ?? 0)) because providers
 *     occasionally return strings or omit fields entirely.
 *   - Yields/rates that come back as fractions (0.04) are normalised to
 *     percentages (4) where the UI expects them.
 */
import { OpenBBError } from "./errors";
import type {
  BalanceSheet,
  CashFlow,
  CompanyProfile,
  DividendOpts,
  DividendRecord,
  EarningsEvent,
  EconomicDataPoint,
  EconomicIndicatorOpts,
  EtfCountryWeight,
  EtfHolding,
  EtfInfo,
  EtfSectorWeight,
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
  FredDataPoint,
  FredOpts,
  FundamentalOpts,
  HistoricalPriceOpts,
  IncomeStatement,
  OHLCVBar,
  OptionContract,
  OptionsChain,
  OptionsChainOpts,
  Quote,
  SearchResult,
} from "./types";

type Params = Record<string, string | number | boolean | undefined>;

function parseNewsArticle(r: Record<string, unknown>, fallbackSymbol?: string): NewsArticle {
  const rawSymbols = r.symbols ?? r.tickers ?? r.stocks;
  let symbols: string[] = [];
  if (Array.isArray(rawSymbols)) {
    symbols = rawSymbols.map((s) => String(s)).filter(Boolean);
  } else if (typeof rawSymbols === "string") {
    symbols = rawSymbols.split(/[,;\s]+/).filter(Boolean);
  }
  if (symbols.length === 0 && fallbackSymbol) symbols = [fallbackSymbol];

  const images = r.images;
  let imageUrl: string | null = null;
  if (typeof r.image === "string") imageUrl = r.image;
  else if (typeof r.image_url === "string") imageUrl = r.image_url;
  else if (Array.isArray(images) && images[0]) {
    const first = images[0] as Record<string, unknown> | string;
    imageUrl = typeof first === "string" ? first : (typeof first?.url === "string" ? first.url : null);
  }

  return {
    title: String(r.title ?? r.headline ?? ""),
    url: String(r.url ?? r.link ?? ""),
    publishedAt: r.date != null ? String(r.date) : (r.published_at != null ? String(r.published_at) : (r.published_utc != null ? String(r.published_utc) : null)),
    source: r.source != null ? String(r.source) : (r.publisher != null ? String(r.publisher) : null),
    author: r.author != null ? String(r.author) : null,
    summary: r.text != null ? String(r.text) : (r.description != null ? String(r.description) : (r.summary != null ? String(r.summary) : null)),
    imageUrl,
    symbols,
  };
}

// Some build hosts (Vercel's strict tsc) resolve a stripped-down `Response`
// interface missing the standard Fetch members.
type FetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
};

export class OpenBBClient {
  private baseUrl: string;
  private timeout: number;

  constructor(opts?: { baseUrl?: string; timeoutMs?: number }) {
    this.baseUrl = opts?.baseUrl ?? process.env.OPENBB_BASE_URL ?? "http://localhost:6900";
    this.timeout = opts?.timeoutMs ?? 30_000;
  }

  private async request<T>(path: string, params?: Params): Promise<T> {
    const url = new URL(`/api/v1${path}`, this.baseUrl);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = (await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      })) as unknown as FetchResponse;

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new OpenBBError(
          `OpenBB ${path} returned ${res.status}: ${body.slice(0, 500)}`,
          res.status,
          path,
        );
      }

      const json = await res.json();
      const results = (json as { results?: T }).results;
      return results !== undefined ? results : (json as T);
    } finally {
      clearTimeout(timer);
    }
  }

  // ── Equity Price ──────────────────────────────────────────────────────

  async getHistoricalPrice(symbol: string, opts: HistoricalPriceOpts): Promise<OHLCVBar[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/price/historical", {
      symbol,
      start_date: opts.startDate,
      end_date: opts.endDate,
      interval: opts.interval,
      provider: opts.provider ?? "yfinance",
    });
    return raw.map((r) => {
      const adj = r.adj_close ?? r.adjusted_close ?? r.adjclose;
      return {
        date: String(r.date ?? ""),
        open: Number(r.open ?? 0),
        high: Number(r.high ?? 0),
        low: Number(r.low ?? 0),
        close: Number(r.close ?? 0),
        volume: Number(r.volume ?? 0),
        adjClose: adj != null ? Number(adj) : null,
      };
    });
  }

  async getQuote(symbol: string, provider?: string): Promise<Quote> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/price/quote", {
      symbol,
      provider: provider ?? "yfinance",
    });
    const r = raw[0] ?? {};
    return {
      symbol: String(r.symbol ?? symbol),
      name: r.name != null ? String(r.name) : null,
      last: Number(r.last_price ?? r.price ?? r.close ?? 0),
      open: r.open != null ? Number(r.open) : null,
      high: r.high != null ? Number(r.high) : null,
      low: r.low != null ? Number(r.low) : null,
      close: r.close != null ? Number(r.close) : null,
      change: r.change != null ? Number(r.change) : null,
      changePercent: r.change_percent != null ? Number(r.change_percent) : null,
      volume: r.volume != null ? Number(r.volume) : null,
      previousClose: r.prev_close != null ? Number(r.prev_close) : null,
      marketCap: r.market_cap != null ? Number(r.market_cap) : null,
    };
  }

  // ── Equity Fundamentals ───────────────────────────────────────────────

  async getDividends(symbol: string, opts?: DividendOpts): Promise<DividendRecord[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/fundamental/dividends", {
      symbol,
      start_date: opts?.startDate,
      end_date: opts?.endDate,
      provider: opts?.provider ?? "yfinance",
    });
    return raw.map((r) => ({
      exDividendDate: r.ex_dividend_date != null ? String(r.ex_dividend_date) : null,
      payDate: r.pay_date != null ? String(r.pay_date) : null,
      amount: Number(r.amount ?? r.dividend ?? 0),
      currency: r.currency != null ? String(r.currency) : null,
    }));
  }

  async getIncomeStatement(symbol: string, opts?: FundamentalOpts): Promise<IncomeStatement[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/fundamental/income", {
      symbol,
      period: opts?.period ?? "annual",
      limit: opts?.limit ?? 5,
      provider: opts?.provider ?? "fmp",
    });
    return raw.map((r) => ({
      period: String(r.period ?? r.date ?? ""),
      fiscalYear: r.calendar_year != null ? Number(r.calendar_year) : null,
      revenue: r.revenue != null ? Number(r.revenue) : null,
      grossProfit: r.gross_profit != null ? Number(r.gross_profit) : null,
      operatingIncome: r.operating_income != null ? Number(r.operating_income) : null,
      netIncome: r.net_income != null ? Number(r.net_income) : null,
      eps: r.eps != null ? Number(r.eps) : null,
      epsDiluted: r.eps_diluted != null ? Number(r.eps_diluted) : null,
    }));
  }

  async getBalanceSheet(symbol: string, opts?: FundamentalOpts): Promise<BalanceSheet[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/fundamental/balance", {
      symbol,
      period: opts?.period ?? "annual",
      limit: opts?.limit ?? 5,
      provider: opts?.provider ?? "fmp",
    });
    return raw.map((r) => ({
      period: String(r.period ?? r.date ?? ""),
      fiscalYear: r.calendar_year != null ? Number(r.calendar_year) : null,
      totalAssets: r.total_assets != null ? Number(r.total_assets) : null,
      totalLiabilities: r.total_liabilities != null ? Number(r.total_liabilities) : null,
      totalEquity: r.total_stockholders_equity != null ? Number(r.total_stockholders_equity) : null,
      cashAndEquivalents: r.cash_and_cash_equivalents != null ? Number(r.cash_and_cash_equivalents) : null,
      totalDebt: r.total_debt != null ? Number(r.total_debt) : null,
    }));
  }

  async getCashFlow(symbol: string, opts?: FundamentalOpts): Promise<CashFlow[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/fundamental/cash", {
      symbol,
      period: opts?.period ?? "annual",
      limit: opts?.limit ?? 5,
      provider: opts?.provider ?? "fmp",
    });
    return raw.map((r) => ({
      period: String(r.period ?? r.date ?? ""),
      fiscalYear: r.calendar_year != null ? Number(r.calendar_year) : null,
      operatingCashFlow: r.operating_cash_flow != null ? Number(r.operating_cash_flow) : null,
      investingCashFlow: r.investing_cash_flow != null ? Number(r.investing_cash_flow) : null,
      financingCashFlow: r.financing_cash_flow != null ? Number(r.financing_cash_flow) : null,
      freeCashFlow: r.free_cash_flow != null ? Number(r.free_cash_flow) : null,
      capitalExpenditure: r.capital_expenditure != null ? Number(r.capital_expenditure) : null,
    }));
  }

  async getCompanyProfile(symbol: string, provider?: string): Promise<CompanyProfile> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/profile", {
      symbol,
      provider: provider ?? "fmp",
    });
    const r = raw[0] ?? {};
    return {
      symbol: String(r.symbol ?? symbol),
      name: String(r.name ?? r.company_name ?? ""),
      sector: r.sector != null ? String(r.sector) : null,
      industry: r.industry != null ? String(r.industry) : null,
      description: r.description != null ? String(r.description) : null,
      country: r.country != null ? String(r.country) : null,
      exchange: r.exchange != null ? String(r.exchange) : null,
      marketCap: r.market_cap != null ? Number(r.market_cap) : null,
      employees: r.full_time_employees != null ? Number(r.full_time_employees) : null,
      website: r.website != null ? String(r.website) : null,
      ceo: r.ceo != null ? String(r.ceo) : null,
    };
  }

  async getEarningsCalendar(symbol: string, provider?: string): Promise<EarningsEvent[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/calendar/earnings", {
      symbol,
      provider: provider ?? "fmp",
    });
    return raw.map((r) => ({
      symbol: String(r.symbol ?? symbol),
      reportDate: r.report_date != null ? String(r.report_date) : (r.date != null ? String(r.date) : null),
      epsEstimate: r.eps_estimated != null ? Number(r.eps_estimated) : null,
      epsActual: r.eps_actual != null ? Number(r.eps_actual) : null,
      revenueEstimate: r.revenue_estimated != null ? Number(r.revenue_estimated) : null,
      revenueActual: r.revenue_actual != null ? Number(r.revenue_actual) : null,
    }));
  }

  // ── Search ────────────────────────────────────────────────────────────

  async searchEquity(query: string, opts?: { provider?: string; limit?: number }): Promise<SearchResult[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/search", {
      query,
      provider: opts?.provider ?? "sec",
      limit: opts?.limit ?? 20,
    });
    return raw.map((r) => ({
      symbol: String(r.symbol ?? ""),
      name: String(r.name ?? ""),
      exchange: r.exchange != null ? String(r.exchange) : null,
      assetType: r.stock_type != null ? String(r.stock_type) : null,
    }));
  }

  // ── Derivatives ───────────────────────────────────────────────────────

  async getOptionsChain(symbol: string, opts?: OptionsChainOpts): Promise<OptionsChain> {
    const raw = await this.request<Array<Record<string, unknown>>>("/derivatives/options/chains", {
      symbol,
      expiration: opts?.expiration,
      provider: opts?.provider ?? "cboe",
    });

    const calls: OptionContract[] = [];
    const puts: OptionContract[] = [];
    const expirations = new Set<string>();

    for (const r of raw) {
      const exp = String(r.expiration ?? "");
      if (exp) expirations.add(exp);

      const contract: OptionContract = {
        strike: Number(r.strike ?? 0),
        expiration: exp,
        contractType: String(r.option_type ?? "").toLowerCase() === "put" ? "put" : "call",
        lastPrice: r.last_trade_price != null ? Number(r.last_trade_price) : null,
        bid: r.bid != null ? Number(r.bid) : null,
        ask: r.ask != null ? Number(r.ask) : null,
        volume: r.volume != null ? Number(r.volume) : null,
        openInterest: r.open_interest != null ? Number(r.open_interest) : null,
        impliedVolatility: r.implied_volatility != null ? Number(r.implied_volatility) : null,
      };

      if (contract.contractType === "put") puts.push(contract);
      else calls.push(contract);
    }

    return {
      symbol,
      expirations: [...expirations].sort(),
      calls,
      puts,
    };
  }

  // ── Economy ───────────────────────────────────────────────────────────

  async getEconomicIndicators(opts: EconomicIndicatorOpts): Promise<EconomicDataPoint[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/economy/indicators", {
      country: opts.country ?? "united_states",
      symbol: opts.indicator,
      start_date: opts.startDate,
      end_date: opts.endDate,
      provider: opts.provider ?? "econdb",
    });
    return raw.map((r) => ({
      date: String(r.date ?? ""),
      value: Number(r.value ?? 0),
      country: r.country != null ? String(r.country) : null,
    }));
  }

  async getFredSeries(seriesId: string, opts?: FredOpts): Promise<FredDataPoint[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/economy/fred_series", {
      symbol: seriesId,
      start_date: opts?.startDate,
      end_date: opts?.endDate,
      provider: opts?.provider ?? "fred",
    });
    return raw.map((r) => ({
      date: String(r.date ?? ""),
      value: Number(r.value ?? 0),
    }));
  }

  // ── Crypto ────────────────────────────────────────────────────────────

  async getCryptoHistorical(symbol: string, opts: HistoricalPriceOpts): Promise<OHLCVBar[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/crypto/price/historical", {
      symbol,
      start_date: opts.startDate,
      end_date: opts.endDate,
      interval: opts.interval,
      provider: opts.provider ?? "yfinance",
    });
    return raw.map((r) => {
      const adj = r.adj_close ?? r.adjusted_close ?? r.adjclose;
      return {
        date: String(r.date ?? ""),
        open: Number(r.open ?? 0),
        high: Number(r.high ?? 0),
        low: Number(r.low ?? 0),
        close: Number(r.close ?? 0),
        volume: Number(r.volume ?? 0),
        adjClose: adj != null ? Number(adj) : null,
      };
    });
  }

  // ── Index ─────────────────────────────────────────────────────────────

  async getIndexConstituents(indexSymbol: string, provider?: string): Promise<IndexConstituent[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/index/constituents", {
      symbol: indexSymbol,
      provider: provider ?? "fmp",
    });
    return raw.map((r) => ({
      symbol: String(r.symbol ?? ""),
      name: String(r.name ?? r.security ?? ""),
      sector: r.sector != null ? String(r.sector) : null,
      subSector: r.sub_sector != null ? String(r.sub_sector) : (r.sub_industry != null ? String(r.sub_industry) : null),
      headquarters: r.headquarters != null ? String(r.headquarters) : (r.headquarter != null ? String(r.headquarter) : null),
      dateFirstAdded: r.date_first_added != null ? String(r.date_first_added) : null,
      cik: r.cik != null ? String(r.cik) : null,
      founded: r.founded != null ? String(r.founded) : null,
    })).filter((r) => r.symbol);
  }

  // ── Analyst estimates ─────────────────────────────────────────────────

  async getAnalystConsensus(symbol: string, provider?: string): Promise<AnalystConsensus | null> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/estimates/consensus", {
      symbol,
      provider: provider ?? "yfinance",
    });
    const r = raw[0];
    if (!r) return null;
    const num = (k: string): number | null => {
      const v = r[k];
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return {
      symbol: String(r.symbol ?? symbol),
      targetHigh: num("target_high"),
      targetLow: num("target_low"),
      targetMean: num("target_consensus") ?? num("target_mean"),
      targetMedian: num("target_median"),
      recommendation: r.recommendation != null ? String(r.recommendation) : null,
      recommendationMean: num("recommendation_mean"),
      numberOfAnalysts: num("number_of_analysts"),
      currentPrice: num("current_price"),
      currency: r.currency != null ? String(r.currency) : null,
    };
  }

  async getPriceTargets(
    symbol: string,
    opts?: { limit?: number; provider?: string },
  ): Promise<PriceTarget[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/estimates/price_target", {
      symbol,
      limit: opts?.limit ?? 25,
      provider: opts?.provider ?? "benzinga",
    });
    const num = (r: Record<string, unknown>, k: string): number | null => {
      const v = r[k];
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return raw.map((r) => ({
      symbol: String(r.symbol ?? symbol),
      publishedDate: r.published_date != null ? String(r.published_date) : null,
      analystName: r.analyst_name != null ? String(r.analyst_name) : null,
      analystFirm: r.analyst_firm != null
        ? String(r.analyst_firm)
        : r.analyst_company != null
          ? String(r.analyst_company)
          : null,
      priceTarget: num(r, "price_target") ?? num(r, "adj_price_target"),
      priceTargetPrevious: num(r, "price_target_previous") ?? num(r, "previous_adj_price_target"),
      ratingCurrent: r.rating_current != null ? String(r.rating_current) : null,
      ratingPrevious: r.rating_previous != null ? String(r.rating_previous) : null,
      action: r.action != null ? String(r.action) : null,
      currency: r.currency != null ? String(r.currency) : null,
      url: r.url_news != null
        ? String(r.url_news)
        : r.url_analyst != null
          ? String(r.url_analyst)
          : null,
    }));
  }

  // ── Ownership ─────────────────────────────────────────────────────────

  async getInsiderTrading(
    symbol: string,
    opts?: { limit?: number; provider?: string },
  ): Promise<InsiderTrade[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/ownership/insider_trading", {
      symbol,
      limit: opts?.limit ?? 50,
      provider: opts?.provider ?? "sec",
    });
    const num = (r: Record<string, unknown>, k: string): number | null => {
      const v = r[k];
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const bool = (r: Record<string, unknown>, k: string): boolean | null => {
      const v = r[k];
      if (v == null) return null;
      if (typeof v === "boolean") return v;
      const s = String(v).toLowerCase();
      if (s === "true" || s === "1") return true;
      if (s === "false" || s === "0") return false;
      return null;
    };
    return raw.map((r) => {
      const price = num(r, "transaction_price");
      const shares = num(r, "securities_transacted");
      return {
        symbol: String(r.symbol ?? symbol),
        filingDate: r.filing_date != null ? String(r.filing_date) : null,
        transactionDate: r.transaction_date != null ? String(r.transaction_date) : null,
        ownerName: r.owner_name != null ? String(r.owner_name) : null,
        ownerTitle: r.owner_title != null ? String(r.owner_title) : null,
        officer: bool(r, "officer"),
        transactionType: r.transaction_type != null ? String(r.transaction_type) : null,
        acquisitionOrDisposition:
          r.acquisition_or_disposition != null ? String(r.acquisition_or_disposition) : null,
        securitiesOwned: num(r, "securities_owned"),
        securitiesTransacted: shares,
        transactionPrice: price,
        transactionValue:
          num(r, "transaction_value") ??
          (price != null && shares != null ? price * shares : null),
        filingUrl: r.filing_url != null ? String(r.filing_url) : null,
      };
    });
  }

  async getInstitutionalHolders(
    symbol: string,
    opts?: { limit?: number; provider?: string },
  ): Promise<InstitutionalHolder[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/ownership/institutional", {
      symbol,
      limit: opts?.limit ?? 50,
      provider: opts?.provider ?? "fmp",
    });
    const num = (r: Record<string, unknown>, k: string): number | null => {
      const v = r[k];
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return raw.map((r) => ({
      symbol: String(r.symbol ?? symbol),
      holderName:
        r.investor_name != null
          ? String(r.investor_name)
          : r.holder != null
            ? String(r.holder)
            : r.institution_name != null
              ? String(r.institution_name)
              : null,
      dateReported:
        r.date_reported != null
          ? String(r.date_reported)
          : r.date != null
            ? String(r.date)
            : null,
      sharesHeld:
        num(r, "shares_held") ??
        num(r, "shares") ??
        num(r, "current_shares"),
      sharesChange: num(r, "change_in_shares") ?? num(r, "shares_change"),
      sharesChangePercent:
        num(r, "change_in_shares_percentage") ??
        num(r, "shares_change_percent"),
      marketValue: num(r, "market_value") ?? num(r, "value"),
      percentHeld: num(r, "weight") ?? num(r, "percent_of_portfolio"),
    }));
  }

  // ── Fixed Income ──────────────────────────────────────────────────────

  async getYieldCurve(opts?: YieldCurveOpts): Promise<YieldCurvePoint[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/fixedincome/government/yield_curve", {
      provider: opts?.provider ?? "fred",
      date: opts?.date,
      country: opts?.country,
    });
    return raw.map((r) => {
      const rawRate = Number(r.rate ?? 0);
      const rate = rawRate > 0 && rawRate < 1 ? rawRate * 100 : rawRate;
      return {
        date: String(r.date ?? ""),
        maturity: String(r.maturity ?? ""),
        maturityYears: Number(r.maturity_years ?? 0),
        rate,
      };
    });
  }

  async getOecdInterestRate(opts?: OecdInterestRateOpts): Promise<OecdInterestRatePoint[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/economy/interest_rates", {
      provider: "oecd",
      country: opts?.country ?? "united_states",
      duration: opts?.duration ?? "immediate",
      frequency: opts?.frequency ?? "monthly",
      start_date: opts?.startDate,
      end_date: opts?.endDate,
    });
    return raw.map((r) => {
      const v = Number(r.value ?? r.rate ?? 0);
      const rate = v > 0 && v < 1 ? v * 100 : v;
      return {
        date: String(r.date ?? ""),
        rate,
        country: r.country != null ? String(r.country) : null,
      };
    });
  }

  async getCentralBankRate(
    rate: "effr" | "sofr" | "ecb" | "sonia" | "estr" | "iorb",
    opts?: CentralBankRateOpts,
  ): Promise<CentralBankRatePoint[]> {
    // Only federal_reserve and fred are valid for these endpoints; ecb/estr/sonia/iorb require fred.
    const defaultProvider = rate === "effr" || rate === "sofr" ? "federal_reserve" : "fred";
    const raw = await this.request<Array<Record<string, unknown>>>(`/fixedincome/rate/${rate}`, {
      provider: opts?.provider ?? defaultProvider,
      start_date: opts?.startDate,
      end_date: opts?.endDate,
    });
    return raw.map((r) => {
      const n = (v: unknown): number | null => {
        if (v == null) return null;
        const num = Number(v);
        if (!Number.isFinite(num)) return null;
        return num > 0 && num < 1 ? num * 100 : num;
      };
      return {
        date: String(r.date ?? ""),
        rate: n(r.rate) ?? 0,
        upper: n(r.target_range_upper),
        lower: n(r.target_range_lower),
      };
    });
  }

  async getTreasurySpread(opts?: TreasurySpreadOpts): Promise<{ date: string; rate: number }[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/fixedincome/spreads/tcm", {
      provider: opts?.provider ?? "fred",
      maturity: opts?.maturity ?? "3m",
      start_date: opts?.startDate,
      end_date: opts?.endDate,
    });
    return raw.map((r) => ({
      date: String(r.date ?? ""),
      rate: Number(r.rate ?? 0),
    }));
  }

  // ── Shorts ────────────────────────────────────────────────────────────

  async getShortInterest(
    symbol: string,
    provider?: string,
  ): Promise<ShortInterestRecord[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/equity/shorts/short_interest", {
      symbol,
      provider: provider ?? "finra",
    });
    const num = (r: Record<string, unknown>, k: string): number | null => {
      const v = r[k];
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    return raw.map((r) => ({
      symbol: String(r.symbol ?? symbol),
      settlementDate:
        r.settlement_date != null
          ? String(r.settlement_date)
          : r.report_date != null
            ? String(r.report_date)
            : r.date != null
              ? String(r.date)
              : null,
      shortInterest:
        num(r, "short_interest") ??
        num(r, "current_short_position") ??
        num(r, "short_volume"),
      averageDailyVolume:
        num(r, "average_daily_volume") ?? num(r, "avg_daily_share_volume"),
      daysToCover:
        num(r, "days_to_cover") ?? num(r, "days_to_cover_quantity"),
      changePercent: num(r, "change_percent") ?? num(r, "short_interest_change_percent"),
    }));
  }

  // ── News ──────────────────────────────────────────────────────────────

  async getCompanyNews(symbol: string, opts?: NewsOpts): Promise<NewsArticle[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/news/company", {
      symbol,
      limit: opts?.limit ?? 25,
      start_date: opts?.startDate,
      end_date: opts?.endDate,
      provider: opts?.provider ?? "yfinance",
    });
    return raw.map((r) => parseNewsArticle(r, symbol));
  }

  async getWorldNews(opts?: NewsOpts): Promise<NewsArticle[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/news/world", {
      limit: opts?.limit ?? 50,
      start_date: opts?.startDate,
      end_date: opts?.endDate,
      provider: opts?.provider ?? "fmp",
    });
    return raw.map((r) => parseNewsArticle(r));
  }

  // ── ETF ───────────────────────────────────────────────────────────────

  async getEtfInfo(symbol: string, provider?: string): Promise<EtfInfo> {
    const raw = await this.request<Array<Record<string, unknown>>>("/etf/info", {
      symbol,
      provider: provider ?? "yfinance",
    });
    const r = raw[0] ?? {};
    return {
      symbol: String(r.symbol ?? symbol),
      name: String(r.name ?? r.fund_name ?? ""),
      description: r.description != null ? String(r.description) : null,
      inceptionDate: r.inception_date != null ? String(r.inception_date) : null,
      expenseRatio: r.expense_ratio != null ? Number(r.expense_ratio) : (r.net_expense_ratio != null ? Number(r.net_expense_ratio) : null),
      aum: r.aum != null ? Number(r.aum) : (r.total_assets != null ? Number(r.total_assets) : null),
      nav: r.nav != null ? Number(r.nav) : null,
      yield: r.yield != null ? Number(r.yield) : (r.dividend_yield != null ? Number(r.dividend_yield) : null),
      category: r.category != null ? String(r.category) : (r.fund_category != null ? String(r.fund_category) : null),
      issuer: r.issuer != null ? String(r.issuer) : (r.fund_family != null ? String(r.fund_family) : null),
      currency: r.currency != null ? String(r.currency) : null,
    };
  }

  async getEtfHoldings(symbol: string, opts?: { provider?: string; limit?: number }): Promise<EtfHolding[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/etf/holdings", {
      symbol,
      provider: opts?.provider ?? "fmp",
    });
    const rows = raw.map((r) => ({
      symbol: r.symbol != null ? String(r.symbol) : (r.asset != null ? String(r.asset) : null),
      name: String(r.name ?? r.holding_name ?? r.description ?? ""),
      weight: r.weight != null ? Number(r.weight) : (r.weight_percentage != null ? Number(r.weight_percentage) : null),
      shares: r.shares != null ? Number(r.shares) : (r.shares_held != null ? Number(r.shares_held) : null),
      marketValue: r.market_value != null ? Number(r.market_value) : null,
    }));
    return opts?.limit != null ? rows.slice(0, opts.limit) : rows;
  }

  async getEtfSectors(symbol: string, provider?: string): Promise<EtfSectorWeight[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/etf/sectors", {
      symbol,
      provider: provider ?? "fmp",
    });
    return raw
      .map((r) => ({
        sector: String(r.sector ?? r.industry ?? ""),
        weight: Number(r.weight ?? r.weight_percentage ?? 0),
      }))
      .filter((s) => s.sector && Number.isFinite(s.weight));
  }

  async getEtfCountries(symbol: string, provider?: string): Promise<EtfCountryWeight[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/etf/countries", {
      symbol,
      provider: provider ?? "fmp",
    });
    return raw
      .map((r) => ({
        country: String(r.country ?? ""),
        weight: Number(r.weight ?? 0),
      }))
      .filter((c) => c.country && Number.isFinite(c.weight));
  }

  async searchEtf(query: string, opts?: { provider?: string; limit?: number }): Promise<SearchResult[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/etf/search", {
      query,
      provider: opts?.provider ?? "fmp",
      limit: opts?.limit ?? 20,
    });
    return raw.map((r) => ({
      symbol: String(r.symbol ?? ""),
      name: String(r.name ?? ""),
      exchange: r.exchange != null ? String(r.exchange) : null,
      assetType: "etf",
    }));
  }

  // ── Currency ──────────────────────────────────────────────────────────

  async getCurrencyHistorical(pair: string, opts: HistoricalPriceOpts): Promise<OHLCVBar[]> {
    const raw = await this.request<Array<Record<string, unknown>>>("/currency/price/historical", {
      symbol: pair,
      start_date: opts.startDate,
      end_date: opts.endDate,
      interval: opts.interval,
      provider: opts.provider ?? "yfinance",
    });
    return raw.map((r) => {
      const adj = r.adj_close ?? r.adjusted_close ?? r.adjclose;
      return {
        date: String(r.date ?? ""),
        open: Number(r.open ?? 0),
        high: Number(r.high ?? 0),
        low: Number(r.low ?? 0),
        close: Number(r.close ?? 0),
        volume: Number(r.volume ?? 0),
        adjClose: adj != null ? Number(adj) : null,
      };
    });
  }

  // ── Health ────────────────────────────────────────────────────────────

  async isHealthy(): Promise<boolean> {
    try {
      const url = new URL("/openapi.json", this.baseUrl);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5_000);
      try {
        const res = (await fetch(url.toString(), { signal: controller.signal })) as unknown as FetchResponse;
        return res.ok;
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return false;
    }
  }
}
