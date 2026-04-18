import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db } from "@finatalk/db";
import { auth } from "./auth";
import type { IndicatorSpec, Range, Interval, StoredIndicator } from "./schemas/indicator";

export type SummarizeChartFn = (args: {
  symbol: string;
  range: Range;
  interval: Interval;
  indicators: IndicatorSpec[];
  convertTo?: "CAD" | null;
  language?: string;
}) => Promise<{ summary: string; provider: string }>;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatWithAdvisorFn = (args: {
  messages: ChatMessage[];
  context: {
    symbol: string;
    range: Range;
    interval: Interval;
    convertTo?: "CAD" | null;
    activeIndicators: Array<{ spec: IndicatorSpec; hidden: boolean }>;
  };
  language?: string;
}) => Promise<{ response: string; provider: string }>;

export type ChatWithPortfolioAdvisorFn = (args: {
  messages: ChatMessage[];
  context: {
    portfolioTitle: string;
    currency: string;
    holdings: Array<{
      symbol: string;
      quantity: number;
      costBasis: number;
      purchaseDate: string;
    }>;
  };
  language?: string;
}) => Promise<{ response: string; provider: string }>;

export type GenerateAnalysisFn = (args: {
  symbol: string;
  language?: string;
}) => Promise<{
  title: string;
  description: string;
  indicators: StoredIndicator[];
  provider: string;
}>;

export type GeneratePortfolioFn = (args: {
  prompt: string;
  language?: string;
}) => Promise<{
  title: string;
  currency: "USD" | "CAD";
  rationale: string;
  holdings: Array<{
    symbol: string;
    quantity: number;
    costBasis: number;
    rationale: string;
  }>;
  provider: string;
}>;

export type ChatWithResearchFn = (args: {
  messages: ChatMessage[];
  context: {
    symbol?: string | undefined;
    comparisonSymbols?: string[] | undefined;
  };
  language?: string | undefined;
}) => Promise<{
  response: string;
  citations: Array<{ label: string; url: string }>;
  confidence: "high" | "medium" | "low";
  provider: string;
}>;

export type ChatWithScenarioPlannerFn = (args: {
  messages: ChatMessage[];
  context: {
    portfolioTitle: string;
    currency: string;
    holdings: Array<{
      symbol: string;
      quantity: number;
      costBasis: number;
      purchaseDate: string;
    }>;
  };
  language?: string;
}) => Promise<{ response: string; provider: string }>;

export type ChatWithTaxAdvisorFn = (args: {
  messages: ChatMessage[];
  context: {
    portfolios: Array<{
      title: string;
      currency: string;
      accountType: string | null;
      holdings: Array<{
        symbol: string;
        quantity: number;
        costBasis: number;
        purchaseDate: string;
      }>;
    }>;
  };
  language?: string;
}) => Promise<{ response: string; provider: string }>;

export type GenerateBriefingFn = (args: {
  portfolios: Array<{
    title: string;
    currency: string;
    holdings: Array<{ symbol: string; quantity: number }>;
  }>;
  watchlistSymbols: string[];
  language?: string;
}) => Promise<{ briefing: string; provider: string }>;

export type TRPCServices = {
  summarizeChart?: SummarizeChartFn;
  chatWithAdvisor?: ChatWithAdvisorFn;
  chatWithPortfolioAdvisor?: ChatWithPortfolioAdvisorFn;
  generateAnalysis?: GenerateAnalysisFn;
  generatePortfolio?: GeneratePortfolioFn;
  chatWithResearch?: ChatWithResearchFn;
  chatWithScenarioPlanner?: ChatWithScenarioPlannerFn;
  chatWithTaxAdvisor?: ChatWithTaxAdvisorFn;
  generateBriefing?: GenerateBriefingFn;
};

export async function createTRPCContext(
  opts: CreateExpressContextOptions,
  services: TRPCServices = {},
) {
  const session = await auth.api.getSession({
    headers: opts.req.headers as unknown as Headers,
  });

  return {
    db,
    session,
    user: session?.user ?? null,
    req: opts.req,
    res: opts.res,
    services,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
