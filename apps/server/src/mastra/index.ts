import { Mastra } from "@mastra/core/mastra";
import { runAnalysis, type RunAnalysisInput } from "@finatalk/trpc/routers/market";
import { chartSummaryAgent } from "./agents/chart-summary";
import { chartAdvisorAgent } from "./agents/chart-advisor";

type IndicatorSpec = RunAnalysisInput["indicators"][number];

export const mastra = new Mastra({
  agents: { chartSummaryAgent, chartAdvisorAgent },
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
    const last = r.series[r.series.length - 1];
    const tail = r.series.slice(-5).map((p) => roundEntry(p));
    return {
      kind: r.kind,
      spec: r.spec,
      last: last ? roundEntry(last) : null,
      tail,
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
