/**
 * @fileoverview Pluggable AI model selection.
 *
 * Exposes `getLargeModel()` and `getSmallModel()` which lazily resolve the
 * configured provider (`AI_PROVIDER` env: anthropic | openai | groq | gemini |
 * openrouter | github | ollama). Resolution is lazy because dotenv is loaded
 * inside index.ts and ESM import hoisting would otherwise read env vars before
 * .env is parsed.
 *
 * Override the model IDs with `AI_MODEL_LARGE` / `AI_MODEL_SMALL`; defaults
 * are in DEFAULTS below.
 *
 * Provider quirks (each baked into createProviderModel):
 *   - Ollama: forces .chat() endpoint and injects `think: false` so reasoning
 *     models return only their final answer.
 *   - GitHub Models: OpenAI-compatible at /inference, fine-grained PAT
 *     (scope: models:read), .chat() required.
 *   - OpenRouter: OpenAI-compatible at /api/v1; only Chat Completions (no
 *     /responses). Adds analytics headers.
 *
 * See ARCHITECTURE.md §11 for provider switching.
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

export const provider = process.env.AI_PROVIDER ?? "anthropic";

const DEFAULTS: Record<string, { large: string; small: string }> = {
  anthropic:  { large: "claude-sonnet-4-5",                small: "claude-haiku-4-5-20251001" },
  openai:     { large: "gpt-4o",                           small: "gpt-4o-mini" },
  ollama:     { large: "llama3.1",                         small: "llama3.1" },
  groq:       { large: "llama-3.3-70b-versatile",          small: "llama-3.1-8b-instant" },
  openrouter: { large: "anthropic/claude-3.5-sonnet",      small: "meta-llama/llama-3.1-8b-instruct" },
  gemini:     { large: "gemini-2.5-pro",                   small: "gemini-2.5-flash" },
  github:     { large: "openai/gpt-4o",                    small: "openai/gpt-4o-mini" },
};

function defaults(p: string) {
  return DEFAULTS[p] ?? DEFAULTS.anthropic!;
}

// Injects `think: false` into every Ollama request so reasoning/thinking
// models (medgemma, qwen3, deepseek-r1, magistral…) return only the final
// answer. Ollama's OpenAI-compat endpoint accepts this extension field.
//
// `init.body` is read via a typed cast because the lib/@types/node version
// resolved on some build hosts (e.g. Vercel) doesn't expose `body` on
// RequestInit even though Node's native fetch supports it.
const injectThinkFalse: typeof fetch = async (input, init) => {
  let nextInit = init;
  const initBody = (init as { body?: unknown } | undefined)?.body;
  if (typeof initBody === "string") {
    try {
      const body: unknown = JSON.parse(initBody);
      if (body && typeof body === "object") {
        (body as Record<string, unknown>).think = false;
        nextInit = { ...init, body: JSON.stringify(body) };
      }
    } catch {
      /* non-JSON body — leave as-is */
    }
  }
  return fetch(input, nextInit);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createProviderModel(p: string, modelId: string): any {
  if (p === "ollama") {
    const ollama = createOpenAI({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      apiKey: "ollama",
      fetch: injectThinkFalse,
    });
    // .chat() forces the Chat Completions endpoint; Ollama's OpenAI-compat
    // layer doesn't expose the new /responses endpoint that the SDK now
    // defaults to.
    return ollama.chat(modelId);
  }
  if (p === "openai") {
    const openai = createOpenAI();
    return openai(modelId);
  }
  if (p === "groq") {
    const groq = createGroq();
    return groq(modelId);
  }
  if (p === "gemini") {
    // @ai-sdk/google reads GOOGLE_GENERATIVE_AI_API_KEY from env automatically.
    const gemini = createGoogleGenerativeAI();
    return gemini(modelId);
  }
  if (p === "github") {
    // GitHub Models is OpenAI-compatible at /inference/chat/completions
    // and authenticates with a fine-grained PAT (scope: models:read).
    // .chat() pins us to Chat Completions; the SDK's default Responses API
    // path doesn't exist on this host.
    const apiKey = process.env.GITHUB_TOKEN ?? process.env.GITHUB_MODELS_TOKEN;
    const ghm = createOpenAI({
      baseURL: process.env.GITHUB_MODELS_BASE_URL ?? "https://models.github.ai/inference",
      ...(apiKey ? { apiKey } : {}),
    });
    return ghm.chat(modelId);
  }
  if (p === "openrouter") {
    // OpenRouter is OpenAI-compatible at /api/v1 but only speaks Chat
    // Completions, not the new Responses API. .chat(modelId) pins us to
    // /chat/completions; without it the SDK posts to /responses and
    // OpenRouter rejects with "Invalid Responses API request".
    // The two custom headers are optional but help the app show up in
    // OpenRouter's analytics (their attribution best-practice).
    const apiKey = process.env.OPENROUTER_API_KEY;
    const openrouter = createOpenAI({
      baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
      ...(apiKey ? { apiKey } : {}),
      headers: {
        "HTTP-Referer": process.env.APP_URL ?? "https://finatalk.local",
        "X-Title": "Finatalk",
      },
    });
    return openrouter.chat(modelId);
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
