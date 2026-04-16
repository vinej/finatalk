import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

export const provider = process.env.AI_PROVIDER ?? "anthropic";

const DEFAULTS: Record<string, { large: string; small: string }> = {
  anthropic: { large: "claude-sonnet-4-5", small: "claude-haiku-4-5-20251001" },
  openai:    { large: "gpt-4o",            small: "gpt-4o-mini" },
  ollama:    { large: "llama3.1",          small: "llama3.1" },
};

function defaults(p: string) {
  return DEFAULTS[p] ?? DEFAULTS.anthropic!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createProviderModel(p: string, modelId: string): any {
  if (p === "ollama") {
    const ollama = createOpenAI({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      apiKey: "ollama",
    });
    return ollama(modelId);
  }
  if (p === "openai") {
    const openai = createOpenAI();
    return openai(modelId);
  }
  const anthropic = createAnthropic();
  return anthropic(modelId);
}

// Lazy so env vars (loaded by dotenv at top-level of index.ts) are read at
// first use, not at module-evaluation time where ESM import hoisting means
// dotenv hasn't run yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _large: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _small: any;

export function getLargeModel() {
  if (!_large) {
    const id = process.env.AI_MODEL_LARGE ?? defaults(provider).large;
    _large = createProviderModel(provider, id);
  }
  return _large;
}

export function getSmallModel() {
  if (!_small) {
    const id = process.env.AI_MODEL_SMALL ?? defaults(provider).small;
    _small = createProviderModel(provider, id);
  }
  return _small;
}
