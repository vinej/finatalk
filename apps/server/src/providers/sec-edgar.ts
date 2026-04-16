import { db } from "@finatalk/db";
import { edgarCache } from "@finatalk/db/schema";
import { eq, lte } from "drizzle-orm";

const SEC_UA =
  process.env.SEC_USER_AGENT ?? "FinaTalk research@finatalk.com";

const TTL_TICKER_MAP = 30 * 86_400;
const TTL_FILING_LIST = 86_400;
const TTL_FILING_TEXT = 7 * 86_400;
const TTL_COMPANY_FACTS = 86_400;

// ── Rate-limit semaphore (SEC allows ~10 req/s) ──────────────────────────

let inflight = 0;
const queue: Array<() => void> = [];
const MAX_CONCURRENT = 6;

function acquire(): Promise<void> {
  if (inflight < MAX_CONCURRENT) {
    inflight++;
    return Promise.resolve();
  }
  return new Promise((resolve) => queue.push(resolve));
}

function release(): void {
  const next = queue.shift();
  if (next) {
    next();
  } else {
    inflight--;
  }
}

async function secFetch(url: string): Promise<Response> {
  await acquire();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": SEC_UA,
        Accept: "application/json, text/html, */*",
      },
    });
    if (!res.ok) throw new Error(`SEC ${res.status}: ${url}`);
    return res;
  } finally {
    release();
  }
}

// ── Postgres-backed cache ────────────────────────────────────────────────

async function cachedFetch(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<string>,
): Promise<string> {
  const [row] = await db
    .select()
    .from(edgarCache)
    .where(eq(edgarCache.key, key))
    .limit(1);

  if (row && new Date(row.expiresAt) > new Date()) return row.value;

  const value = await fn();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  await db
    .insert(edgarCache)
    .values({ key, value, expiresAt })
    .onConflictDoUpdate({
      target: edgarCache.key,
      set: { value, expiresAt, createdAt: new Date() },
    });

  return value;
}

// ── Ticker → CIK mapping ────────────────────────────────────────────────

type TickerMapEntry = { cik_str: number; ticker: string; title: string };

let tickerMap: Map<string, string> | null = null;

export async function fetchTickerToCik(): Promise<Map<string, string>> {
  if (tickerMap) return tickerMap;

  const raw = await cachedFetch("sec:ticker-map", TTL_TICKER_MAP, async () => {
    const res = await secFetch("https://www.sec.gov/files/company_tickers.json");
    return res.text();
  });

  const data: Record<string, TickerMapEntry> = JSON.parse(raw);
  tickerMap = new Map<string, string>();
  for (const entry of Object.values(data)) {
    tickerMap.set(
      entry.ticker.toUpperCase(),
      String(entry.cik_str).padStart(10, "0"),
    );
  }
  return tickerMap;
}

export function symbolToCik(map: Map<string, string>, symbol: string): string {
  const cik = map.get(symbol.toUpperCase());
  if (!cik) throw new Error(`No SEC CIK found for ticker "${symbol}".`);
  return cik;
}

// ── Filing list ──────────────────────────────────────────────────────────

export type FilingMeta = {
  form: string;
  filedAt: string;
  accession: string;
  primaryDocUrl: string;
  description: string;
};

export async function fetchRecentFilings(
  cik: string,
  opts: { formTypes?: string[]; limit?: number } = {},
): Promise<FilingMeta[]> {
  const limit = opts.limit ?? 10;
  const formFilter = opts.formTypes
    ? new Set(opts.formTypes.map((f) => f.toUpperCase()))
    : null;

  const raw = await cachedFetch(`sec:submissions:${cik}`, TTL_FILING_LIST, async () => {
    const res = await secFetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
    );
    return res.text();
  });

  const data = JSON.parse(raw);
  const recent = data.filings?.recent ?? data;
  const forms: string[] = recent.form ?? [];
  const dates: string[] = recent.filingDate ?? [];
  const accessions: string[] = recent.accessionNumber ?? [];
  const primaryDocs: string[] = recent.primaryDocument ?? [];
  const descriptions: string[] = recent.primaryDocDescription ?? [];

  const out: FilingMeta[] = [];
  for (let i = 0; i < forms.length && out.length < limit; i++) {
    const form = forms[i]!;
    if (formFilter && !formFilter.has(form.toUpperCase())) continue;
    const accNum = accessions[i]!.replace(/-/g, "");
    out.push({
      form,
      filedAt: dates[i]!,
      accession: accessions[i]!,
      primaryDocUrl: `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accNum}/${primaryDocs[i]}`,
      description: descriptions[i] ?? "",
    });
  }
  return out;
}

// ── Filing full text ─────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchFilingText(primaryDocUrl: string): Promise<string> {
  const cacheKey = `sec:doc:${primaryDocUrl}`;
  return cachedFetch(cacheKey, TTL_FILING_TEXT, async () => {
    const res = await secFetch(primaryDocUrl);
    const html = await res.text();
    return stripHtml(html);
  });
}

// ── Company XBRL facts ───────────────────────────────────────────────────

export type FactPoint = {
  val: number;
  end: string;
  form: string;
  fy: number;
  fp: string;
};

export type CompanyFacts = Record<string, FactPoint[]>;

const COMMON_CONCEPTS = [
  "Revenues",
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "NetIncomeLoss",
  "LongTermDebt",
  "LongTermDebtNoncurrent",
  "Assets",
  "Liabilities",
  "StockholdersEquity",
  "OperatingIncomeLoss",
  "EarningsPerShareBasic",
  "EarningsPerShareDiluted",
  "CashAndCashEquivalentsAtCarryingValue",
] as const;

export async function fetchCompanyFacts(
  cik: string,
  concepts?: string[],
): Promise<CompanyFacts> {
  const raw = await cachedFetch(`sec:facts:${cik}`, TTL_COMPANY_FACTS, async () => {
    const res = await secFetch(
      `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
    );
    return res.text();
  });

  const data = JSON.parse(raw);
  const usGaap: Record<string, { units?: Record<string, Array<{ val: number; end: string; form: string; fy: number; fp: string }>> }> =
    data.facts?.["us-gaap"] ?? {};

  const wanted = new Set(concepts ?? COMMON_CONCEPTS);
  const result: CompanyFacts = {};

  for (const [concept, entry] of Object.entries(usGaap)) {
    if (!wanted.has(concept)) continue;
    const usdPoints = entry.units?.["USD"];
    if (!usdPoints) continue;
    result[concept] = usdPoints
      .filter((p) => p.form === "10-K" || p.form === "10-Q")
      .map((p) => ({ val: p.val, end: p.end, form: p.form, fy: p.fy, fp: p.fp }));
  }

  return result;
}

// ── Cache cleanup (optional, run periodically) ───────────────────────────

export async function purgeExpiredCache(): Promise<number> {
  const deleted = await db
    .delete(edgarCache)
    .where(lte(edgarCache.expiresAt, new Date()));
  return (deleted as unknown as { rowCount?: number }).rowCount ?? 0;
}
