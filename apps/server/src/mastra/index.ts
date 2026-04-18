import { Mastra } from "@mastra/core/mastra";
import { z } from "zod";
import { indicatorTail, runAnalysis, type RunAnalysisInput } from "@finatalk/trpc/routers/market";
import { StoredIndicator } from "@finatalk/trpc/schemas/indicator";
import { chartSummaryAgent } from "./agents/chart-summary";
import { chartAdvisorAgent } from "./agents/chart-advisor";
import { portfolioAdvisorAgent } from "./agents/portfolio-advisor";
import { analysisGeneratorAgent } from "./agents/analysis-generator";
import { portfolioGeneratorAgent } from "./agents/portfolio-generator";
import { researchAdvisorAgent } from "./agents/research-advisor";
import { scenarioPlannerAgent } from "./agents/scenario-planner";

type IndicatorSpec = RunAnalysisInput["indicators"][number];

export const mastra = new Mastra({
  agents: {
    chartSummaryAgent,
    chartAdvisorAgent,
    portfolioAdvisorAgent,
    analysisGeneratorAgent,
    portfolioGeneratorAgent,
    researchAdvisorAgent,
    scenarioPlannerAgent,
  },
});

const MAX_BARS = 60;

function buildSnapshot(input: RunAnalysisInput, language: string, analysis: Awaited<ReturnType<typeof runAnalysis>>) {
  const recent = analysis.candles.slice(-MAX_BARS).map((c) => ({
    t: new Date(c.time * 1000).toISOString().slice(0, 10),
    o: round(c.open),
    h: round(c.high),
    l: round(c.low),
    c: round(c.close),
    v: c.volume,
  }));
  const latest = recent[recent.length - 1];
  const first = recent[0];
  const indicators = analysis.results.map((r) => {
    const { last, tail, events } = indicatorTail(r);
    return {
      kind: r.kind,
      spec: r.spec,
      last: last ? roundEntry(last) : null,
      tail: tail.map((p) => roundEntry(p)),
      ...(events ? { events: events.slice(-5) } : {}),
    };
  });
  return {
    userLanguage: language,
    symbol: analysis.symbol,
    range: input.range,
    interval: input.interval,
    nativeCurrency: analysis.nativeCurrency,
    displayCurrency: analysis.displayCurrency,
    barCount: analysis.candles.length,
    windowFirstDate: first?.t ?? null,
    windowLastDate: latest?.t ?? null,
    latestClose: latest?.c ?? null,
    windowLow: round(Math.min(...recent.map((b) => b.l))),
    windowHigh: round(Math.max(...recent.map((b) => b.h))),
    bars: recent,
    indicators,
  };
}

function round(n: number, digits = 4): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function roundEntry<T extends Record<string, unknown>>(p: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    out[k] = typeof v === "number" && k !== "time" ? round(v) : v;
  }
  return out as T;
}

export type SummarizeChartArgs = RunAnalysisInput & { language?: string };

export async function summarizeChart(args: SummarizeChartArgs): Promise<{ summary: string; provider: string }> {
  const { language = "en", ...analysisInput } = args;
  const analysis = await runAnalysis(analysisInput);
  const snapshot = buildSnapshot(analysisInput, language, analysis);
  const result = await chartSummaryAgent.generate([
    {
      role: "user",
      content: `Snapshot of the chart the user is currently viewing. Write the summary per the rules in your system instructions.\n\n${JSON.stringify(snapshot)}`,
    },
  ]);
  return { summary: result.text, provider: process.env.AI_PROVIDER ?? "anthropic" };
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatWithAdvisorArgs = {
  messages: ChatMessage[];
  context: {
    symbol: string;
    range: RunAnalysisInput["range"];
    interval: RunAnalysisInput["interval"];
    convertTo?: "CAD" | null;
    activeIndicators: Array<{ spec: IndicatorSpec; hidden: boolean }>;
  };
  language?: string;
};

const MAX_HISTORY_MESSAGES = 30;
const MAX_HISTORY_CHARS = 50_000;

function trimHistory(history: ChatMessage[]): ChatMessage[] {
  let trimmed = history.slice(-MAX_HISTORY_MESSAGES);
  let total = trimmed.reduce((s, m) => s + m.content.length, 0);
  while (total > MAX_HISTORY_CHARS && trimmed.length > 1) {
    total -= trimmed[0]!.content.length;
    trimmed = trimmed.slice(1);
  }
  return trimmed;
}

export async function chatWithAdvisor(args: ChatWithAdvisorArgs): Promise<{ response: string; provider: string }> {
  const { messages, context, language = "en" } = args;
  const contextBlock = {
    userLanguage: language,
    currentChart: {
      symbol: context.symbol,
      range: context.range,
      interval: context.interval,
      convertTo: context.convertTo ?? null,
    },
    activeIndicators: context.activeIndicators.map((a) => ({
      spec: a.spec,
      visibleOnChart: !a.hidden,
    })),
  };
  const history = trimHistory(messages);
  const preamble: ChatMessage = {
    role: "user",
    content:
      `Context about what the user is currently looking at (do not quote this verbatim to the user, use it to ground your answers):\n${JSON.stringify(contextBlock)}`,
  };
  const result = await chartAdvisorAgent.generate([preamble, ...history]);
  return { response: result.text, provider: process.env.AI_PROVIDER ?? "anthropic" };
}

export type PortfolioAdvisorHolding = {
  symbol: string;
  quantity: number;
  costBasis: number;
  purchaseDate: string;
};

export type ChatWithPortfolioAdvisorArgs = {
  messages: ChatMessage[];
  context: {
    portfolioTitle: string;
    currency: string;
    holdings: PortfolioAdvisorHolding[];
  };
  language?: string;
};

export async function chatWithPortfolioAdvisor(
  args: ChatWithPortfolioAdvisorArgs,
): Promise<{ response: string; provider: string }> {
  const { messages, context, language = "en" } = args;
  const contextBlock = {
    userLanguage: language,
    portfolio: {
      title: context.portfolioTitle,
      currency: context.currency,
      holdings: context.holdings,
    },
  };
  const history = trimHistory(messages);
  const preamble: ChatMessage = {
    role: "user",
    content:
      `Context about the user's portfolio (do not quote this verbatim, use it to ground your answers):\n${JSON.stringify(contextBlock)}`,
  };
  const result = await portfolioAdvisorAgent.generate([preamble, ...history]);
  return { response: result.text, provider: process.env.AI_PROVIDER ?? "anthropic" };
}

const GeneratedAnalysisSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000),
  indicators: z.array(StoredIndicator).min(1).max(8),
});
export type GeneratedAnalysis = z.infer<typeof GeneratedAnalysisSchema>;

export type GenerateAnalysisArgs = {
  symbol: string;
  language?: string;
};

export async function generateAnalysisForSymbol(
  args: GenerateAnalysisArgs,
): Promise<GeneratedAnalysis & { provider: string }> {
  const { symbol, language = "en" } = args;
  const preamble = {
    role: "user" as const,
    content:
      `Generate a technical-analysis indicator set for ONE symbol. ` +
      `Symbol: ${symbol}. User language: ${language}. ` +
      `Follow your workflow: call listAvailableIndicators, then analyzeSymbol for ${symbol}, ` +
      `then return the structured object. Title and description MUST be written in the user language (${language}).`,
  };
  const result = await analysisGeneratorAgent.generate([preamble]);
  const parsed = GeneratedAnalysisSchema.parse(extractJson(result.text));
  return { ...parsed, provider: process.env.AI_PROVIDER ?? "anthropic" };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Agent did not return JSON.");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

const GeneratedPortfolioSchema = z.object({
  title: z.string().trim().min(1).max(120),
  currency: z.enum(["USD", "CAD"]),
  rationale: z.string().max(2000),
  holdings: z
    .array(
      z.object({
        symbol: z.string().trim().min(1).max(20),
        quantity: z.number().positive(),
        costBasis: z.number().nonnegative(),
        rationale: z.string().max(500),
      }),
    )
    .min(1)
    .max(12),
});
export type GeneratedPortfolio = z.infer<typeof GeneratedPortfolioSchema>;

export type GeneratePortfolioArgs = {
  prompt: string;
  language?: string;
};

export async function generatePortfolioFromPrompt(
  args: GeneratePortfolioArgs,
): Promise<GeneratedPortfolio & { provider: string }> {
  const { prompt, language = "en" } = args;
  const preamble = {
    role: "user" as const,
    content:
      `Build a single draft portfolio from this user request. ` +
      `User language: ${language}. ` +
      `User request: ${prompt}\n\n` +
      `Follow your workflow: parse the request, call getLatestPrice for every ticker you pick ` +
      `(convertTo = the target currency from the request), size quantities to the budget, ` +
      `then return the JSON object. Title, rationale, and per-holding rationale MUST be in ${language}.`,
  };
  const result = await portfolioGeneratorAgent.generate([preamble]);
  const parsed = GeneratedPortfolioSchema.parse(extractJson(result.text));
  return { ...parsed, provider: process.env.AI_PROVIDER ?? "anthropic" };
}

// ── Research advisor ─────────────────────────────────────────────────────

const ResearchCitationSchema = z.object({
  citations: z.array(z.object({ label: z.string(), url: z.string() })),
  confidence: z.enum(["high", "medium", "low"]),
});

export type ResearchCitation = z.infer<typeof ResearchCitationSchema>;

export type ChatWithResearchAdvisorArgs = {
  messages: ChatMessage[];
  context: {
    symbol?: string | undefined;
    comparisonSymbols?: string[] | undefined;
  };
  language?: string | undefined;
};

export type ResearchAdvisorResult = {
  response: string;
  citations: ResearchCitation["citations"];
  confidence: ResearchCitation["confidence"];
  provider: string;
};

export async function chatWithResearchAdvisor(
  args: ChatWithResearchAdvisorArgs,
): Promise<ResearchAdvisorResult> {
  const { messages, context, language = "en" } = args;

  const contextBlock = {
    userLanguage: language,
    focusSymbol: context.symbol ?? null,
    comparisonSymbols: context.comparisonSymbols ?? [],
  };

  const history = trimHistory(messages);
  const preamble: ChatMessage = {
    role: "user",
    content:
      `Context about the user's research session (use to ground your answers, do not quote verbatim):\n${JSON.stringify(contextBlock)}`,
  };

  const result = await researchAdvisorAgent.generate([preamble, ...history]);
  const fullText = result.text;

  const jsonFenceMatch = fullText.match(/```json\s*([\s\S]*?)```/);
  let citations: ResearchCitation["citations"] = [];
  let confidence: ResearchCitation["confidence"] = "medium";
  let responseText = fullText;

  if (jsonFenceMatch) {
    responseText = fullText.slice(0, jsonFenceMatch.index).trim();
    try {
      const parsed = ResearchCitationSchema.parse(JSON.parse(jsonFenceMatch[1]!.trim()));
      citations = parsed.citations;
      confidence = parsed.confidence;
    } catch {
      // If JSON parse fails, return the full text as response
    }
  }

  return {
    response: responseText,
    citations,
    confidence,
    provider: process.env.AI_PROVIDER ?? "anthropic",
  };
}

// ── Scenario planner ────────────────────────────────────────────────────

export type ChatWithScenarioPlannerArgs = {
  messages: ChatMessage[];
  context: {
    portfolioTitle: string;
    currency: string;
    holdings: PortfolioAdvisorHolding[];
  };
  language?: string;
};

export async function chatWithScenarioPlanner(
  args: ChatWithScenarioPlannerArgs,
): Promise<{ response: string; provider: string }> {
  const { messages, context, language = "en" } = args;
  const contextBlock = {
    userLanguage: language,
    portfolio: {
      title: context.portfolioTitle,
      currency: context.currency,
      holdings: context.holdings,
    },
  };
  const history = trimHistory(messages);
  const preamble: ChatMessage = {
    role: "user",
    content:
      `Context about the user's portfolio for scenario analysis (do not quote verbatim, use to ground your answers):\n${JSON.stringify(contextBlock)}`,
  };
  const result = await scenarioPlannerAgent.generate([preamble, ...history]);
  return { response: result.text, provider: process.env.AI_PROVIDER ?? "anthropic" };
}
