import type { IndexConstituent } from "@finatalk/openbb";

// Some build hosts (Vercel's strict tsc) resolve a stripped-down `Response`
// interface missing the standard Fetch members.
type FetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
};

type IndexKey = "sp500" | "nasdaq" | "dowjones" | "tsx" | "tsx60";

const PAGES: Record<IndexKey, string> = {
  sp500: "List_of_S%26P_500_companies",
  nasdaq: "Nasdaq-100",
  dowjones: "Dow_Jones_Industrial_Average",
  tsx: "S%26P/TSX_Composite_Index",
  tsx60: "S%26P/TSX_60",
};

const USER_AGENT = "FinaTalk/1.0 (https://finatalk.app) index-constituents";

async function fetchPageHtml(page: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&format=json&prop=text&formatversion=2&origin=*`;
  const res = (await fetch(url, { headers: { "User-Agent": USER_AGENT } })) as unknown as FetchResponse;
  if (!res.ok) throw new Error(`Wikipedia fetch failed: ${res.status}`);
  const data = (await res.json()) as { parse?: { text?: string }; error?: { info?: string } };
  if (data.error) throw new Error(`Wikipedia error: ${data.error.info ?? "unknown"}`);
  const html = data.parse?.text;
  if (!html) throw new Error("Wikipedia returned no HTML");
  return html;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractWikitables(html: string): string[] {
  const tables: string[] = [];
  const re = /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) tables.push(m[1]!);
  return tables;
}

function extractRows(tableInner: string): string[][] {
  const rows: string[][] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(tableInner)) !== null) {
    const inner = rm[1]!;
    const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(inner)) !== null) cells.push(stripTags(cm[1]!));
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function cleanSymbol(s: string): string {
  return s.replace(/\s+/g, "").replace(/\./g, "-").toUpperCase();
}

function nullIfEmpty(s: string | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length === 0 || t === "—" || t === "-" ? null : t;
}

async function fetchSp500(): Promise<IndexConstituent[]> {
  const html = await fetchPageHtml(PAGES.sp500);
  const tables = extractWikitables(html);
  if (tables.length === 0) return [];
  // First wikitable is the constituents list.
  const rows = extractRows(tables[0]!);
  const out: IndexConstituent[] = [];
  for (const row of rows.slice(1)) {
    // Columns: Symbol, Security, GICS Sector, GICS Sub-Industry, Headquarters, Date added, CIK, Founded
    if (row.length < 4) continue;
    const symbol = cleanSymbol(row[0]!);
    if (!symbol || !/^[A-Z0-9.\-]+$/.test(symbol)) continue;
    out.push({
      symbol,
      name: row[1] ?? "",
      sector: nullIfEmpty(row[2]),
      subSector: nullIfEmpty(row[3]),
      headquarters: nullIfEmpty(row[4]),
      dateFirstAdded: nullIfEmpty(row[5]),
      cik: nullIfEmpty(row[6]),
      founded: nullIfEmpty(row[7]),
    });
  }
  return out;
}

async function fetchNasdaq100(): Promise<IndexConstituent[]> {
  const html = await fetchPageHtml(PAGES.nasdaq);
  const tables = extractWikitables(html);
  // Find table whose first row contains "Ticker" and "Company" or "GICS Sector"
  for (const t of tables) {
    const rows = extractRows(t);
    if (rows.length < 5) continue;
    const header = rows[0]!.map((h) => h.toLowerCase());
    const tickerIdx = header.findIndex((h) => h.includes("ticker") || h === "symbol");
    const companyIdx = header.findIndex((h) => h.includes("company") || h.includes("security"));
    const sectorIdx = header.findIndex(
      (h) =>
        h.includes("gics sector") ||
        h === "sector" ||
        (h.includes("industry") && !h.includes("sub")),
    );
    const subIdx = header.findIndex(
      (h) =>
        h.includes("sub-industry") ||
        h.includes("sub industry") ||
        h.includes("subsector") ||
        h.includes("sub-sector"),
    );
    if (tickerIdx === -1 || companyIdx === -1) continue;
    const out: IndexConstituent[] = [];
    for (const row of rows.slice(1)) {
      const symbol = cleanSymbol(row[tickerIdx] ?? "");
      if (!symbol || !/^[A-Z0-9.\-]+$/.test(symbol)) continue;
      out.push({
        symbol,
        name: row[companyIdx] ?? "",
        sector: sectorIdx >= 0 ? nullIfEmpty(row[sectorIdx]) : null,
        subSector: subIdx >= 0 ? nullIfEmpty(row[subIdx]) : null,
        headquarters: null,
        dateFirstAdded: null,
        cik: null,
        founded: null,
      });
    }
    if (out.length >= 50) return out;
  }
  return [];
}

async function fetchDowJones(): Promise<IndexConstituent[]> {
  const html = await fetchPageHtml(PAGES.dowjones);
  const tables = extractWikitables(html);
  // Find the components table: header includes "Symbol" and "Industry" (or "Company"/"Exchange").
  for (const t of tables) {
    const rows = extractRows(t);
    if (rows.length < 10) continue;
    const header = rows[0]!.map((h) => h.toLowerCase());
    const symbolIdx = header.findIndex((h) => h === "symbol" || h.includes("ticker"));
    const companyIdx = header.findIndex((h) => h.includes("company"));
    const industryIdx = header.findIndex(
      (h) => h.includes("industry") || h === "sector",
    );
    const dateIdx = header.findIndex((h) => h.includes("date added") || h === "added");
    if (symbolIdx === -1 || companyIdx === -1) continue;
    const out: IndexConstituent[] = [];
    for (const row of rows.slice(1)) {
      const symbol = cleanSymbol(row[symbolIdx] ?? "");
      if (!symbol || !/^[A-Z0-9.\-]+$/.test(symbol)) continue;
      out.push({
        symbol,
        name: row[companyIdx] ?? "",
        sector: industryIdx >= 0 ? nullIfEmpty(row[industryIdx]) : null,
        subSector: null,
        headquarters: null,
        dateFirstAdded: dateIdx >= 0 ? nullIfEmpty(row[dateIdx]) : null,
        cik: null,
        founded: null,
      });
    }
    if (out.length >= 20 && out.length <= 40) return out;
  }
  return [];
}

const TTL_MS = 24 * 60 * 60 * 1000;

export type TsxSymbolEntry = {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
};

async function fetchTsxCompositeRaw(): Promise<TsxSymbolEntry[]> {
  const html = await fetchPageHtml("S%26P/TSX_Composite_Index");
  const tables = extractWikitables(html);
  for (const t of tables) {
    const rows = extractRows(t);
    if (rows.length < 50) continue;
    const header = rows[0]!.map((h) => h.toLowerCase());
    const tickerIdx = header.findIndex((h) => h.startsWith("ticker") || h.startsWith("symbol"));
    const companyIdx = header.findIndex((h) => h.includes("company") || h.includes("security"));
    const sectorIdx = header.findIndex(
      (h) => h.startsWith("sector") || h.includes("gics sector"),
    );
    const industryIdx = header.findIndex(
      (h) => h.startsWith("industry") || h.includes("sub-industry"),
    );
    if (tickerIdx === -1 || companyIdx === -1) continue;
    const out: TsxSymbolEntry[] = [];
    for (const row of rows.slice(1)) {
      const ticker = cleanSymbol(row[tickerIdx] ?? "");
      if (!ticker || !/^[A-Z0-9.\-]+$/.test(ticker)) continue;
      out.push({
        symbol: ticker,
        name: row[companyIdx] ?? "",
        sector: sectorIdx >= 0 ? nullIfEmpty(row[sectorIdx]) : null,
        industry: industryIdx >= 0 ? nullIfEmpty(row[industryIdx]) : null,
      });
    }
    if (out.length >= 50) return out;
  }
  return [];
}

let tsxCache: { at: number; data: TsxSymbolEntry[] } | null = null;

export async function fetchTsxCompositeSymbols(): Promise<TsxSymbolEntry[]> {
  if (tsxCache && Date.now() - tsxCache.at < TTL_MS) return tsxCache.data;
  const data = await fetchTsxCompositeRaw();
  if (data.length > 0) tsxCache = { at: Date.now(), data };
  return data;
}

function toYahooTsx(ticker: string): string {
  return `${ticker.replace(/\./g, "-")}.TO`;
}

async function fetchTsxComposite(): Promise<IndexConstituent[]> {
  const raw = await fetchTsxCompositeSymbols();
  return raw.map((r) => ({
    symbol: toYahooTsx(r.symbol),
    name: r.name,
    sector: r.sector,
    subSector: r.industry,
    headquarters: null,
    dateFirstAdded: null,
    cik: null,
    founded: null,
  }));
}

async function fetchTsx60(): Promise<IndexConstituent[]> {
  const html = await fetchPageHtml(PAGES.tsx60);
  const tables = extractWikitables(html);
  for (const t of tables) {
    const rows = extractRows(t);
    if (rows.length < 50) continue;
    const header = rows[0]!.map((h) => h.toLowerCase());
    const symbolIdx = header.findIndex((h) => h.startsWith("symbol") || h.startsWith("ticker"));
    const companyIdx = header.findIndex((h) => h.includes("company") || h.includes("security"));
    const sectorIdx = header.findIndex((h) => h.startsWith("sector") || h.includes("industry"));
    if (symbolIdx === -1 || companyIdx === -1) continue;
    const out: IndexConstituent[] = [];
    for (const row of rows.slice(1)) {
      const ticker = cleanSymbol(row[symbolIdx] ?? "");
      if (!ticker || !/^[A-Z0-9.\-]+$/.test(ticker)) continue;
      out.push({
        symbol: toYahooTsx(ticker),
        name: row[companyIdx] ?? "",
        sector: sectorIdx >= 0 ? nullIfEmpty(row[sectorIdx]) : null,
        subSector: null,
        headquarters: null,
        dateFirstAdded: null,
        cik: null,
        founded: null,
      });
    }
    if (out.length >= 50) return out;
  }
  return [];
}

const cache = new Map<IndexKey, { at: number; data: IndexConstituent[] }>();

export async function fetchIndexConstituentsFromWikipedia(
  indexSymbol: IndexKey,
): Promise<IndexConstituent[]> {
  const cached = cache.get(indexSymbol);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const data =
    indexSymbol === "sp500"
      ? await fetchSp500()
      : indexSymbol === "nasdaq"
        ? await fetchNasdaq100()
        : indexSymbol === "dowjones"
          ? await fetchDowJones()
          : indexSymbol === "tsx"
            ? await fetchTsxComposite()
            : await fetchTsx60();

  if (data.length > 0) cache.set(indexSymbol, { at: Date.now(), data });
  return data;
}
