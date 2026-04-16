import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  fetchTickerToCik,
  symbolToCik,
  fetchRecentFilings,
  fetchFilingText,
  fetchCompanyFacts,
} from "../../providers/sec-edgar";

const MAX_EXCERPT_CHARS = 30_000;

export const listCompanyFilings = createTool({
  id: "listCompanyFilings",
  description:
    "List recent SEC filings for a US-listed company. " +
    "Returns metadata (form type, filing date, URL) for the most recent filings. " +
    "Use formTypes to filter: '10-K' (annual report), '10-Q' (quarterly), " +
    "'8-K' (material event), 'DEF 14A' (proxy). " +
    "Call this first to discover which filings exist before fetching their text.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, MSFT"),
    formTypes: z
      .array(z.string())
      .optional()
      .describe("Filter by form types, e.g. ['10-K', '10-Q']. Omit for all types."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Max filings to return (default 10)."),
  }),
  execute: async ({ symbol, formTypes, limit }) => {
    const map = await fetchTickerToCik();
    const cik = symbolToCik(map, symbol);
    const filings = await fetchRecentFilings(cik, {
      ...(formTypes ? { formTypes } : {}),
      ...(limit != null ? { limit } : {}),
    });
    return { symbol: symbol.toUpperCase(), filings };
  },
});

function extractRelevantParagraphs(
  text: string,
  query: string,
  maxChars: number,
): string {
  const paragraphs = text.split(/\n{2,}/);
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (keywords.length === 0) return text.slice(0, maxChars);

  const scored = paragraphs
    .map((p) => {
      const lower = p.toLowerCase();
      const hits = keywords.filter((k) => lower.includes(k)).length;
      return { p, hits };
    })
    .filter((e) => e.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  let result = "";
  for (const { p } of scored) {
    if (result.length + p.length > maxChars) break;
    result += p + "\n\n";
  }

  return result || text.slice(0, maxChars);
}

export const fetchFilingExcerpt = createTool({
  id: "fetchFilingExcerpt",
  description:
    "Fetch the full text of a single SEC filing and return relevant excerpts. " +
    "Pass the primaryDocUrl from listCompanyFilings. " +
    "Optionally pass a query to retrieve only paragraphs matching those keywords; " +
    "if omitted the first ~30k characters are returned. " +
    "Use this to cite specific sections of 10-Ks, 10-Qs, 8-Ks, or proxy statements.",
  inputSchema: z.object({
    filingUrl: z.string().describe("The primaryDocUrl from listCompanyFilings."),
    query: z
      .string()
      .optional()
      .describe("Keywords to filter relevant paragraphs, e.g. 'risk factors debt'."),
    maxChars: z
      .number()
      .int()
      .min(1000)
      .max(60000)
      .optional()
      .describe(`Max characters to return (default ${MAX_EXCERPT_CHARS}).`),
  }),
  execute: async ({ filingUrl, query, maxChars }) => {
    const limit = maxChars ?? MAX_EXCERPT_CHARS;
    const fullText = await fetchFilingText(filingUrl);

    const excerpt = query
      ? extractRelevantParagraphs(fullText, query, limit)
      : fullText.slice(0, limit);

    return {
      url: filingUrl,
      charCount: fullText.length,
      excerptCharCount: excerpt.length,
      excerpt,
    };
  },
});

export const fetchCompanyFinancialsTool = createTool({
  id: "fetchCompanyFinancials",
  description:
    "Fetch structured XBRL financial data for a US-listed company from SEC EDGAR. " +
    "Returns time-series of annual (10-K) and quarterly (10-Q) values for common " +
    "US-GAAP concepts: Revenues, NetIncomeLoss, LongTermDebt, Assets, Liabilities, " +
    "StockholdersEquity, OperatingIncomeLoss, EarningsPerShareDiluted, CashAndCashEquivalentsAtCarryingValue, etc. " +
    "Use this for numeric comparisons, trend analysis, or when you need hard numbers. " +
    "Optionally pass specific concept names to narrow the response.",
  inputSchema: z.object({
    symbol: z.string().describe("Ticker symbol, e.g. AAPL, MSFT"),
    concepts: z
      .array(z.string())
      .optional()
      .describe(
        "Specific US-GAAP concept names to retrieve, e.g. ['Revenues', 'LongTermDebt']. " +
        "Omit to get all common concepts.",
      ),
  }),
  execute: async ({ symbol, concepts }) => {
    const map = await fetchTickerToCik();
    const cik = symbolToCik(map, symbol);
    const facts = await fetchCompanyFacts(cik, concepts);
    return { symbol: symbol.toUpperCase(), facts };
  },
});
