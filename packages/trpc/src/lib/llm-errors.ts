import { TRPCError } from "@trpc/server";

// Centralized mapping of low-level LLM/provider errors (Groq, OpenRouter,
// Anthropic, OpenAI, Gemini, etc.) into TRPCErrors with user-friendly
// messages. The frontend surfaces these messages directly, so they need
// to be readable and actionable for non-technical users.
//
// Heuristics: providers do not use a single error shape, so we sniff
// status codes and message text. The matchers are conservative; anything
// unrecognized falls through to INTERNAL_SERVER_ERROR with the original
// message preserved.

type ErrorWithMaybeStatus = {
  status?: number;
  statusCode?: number;
  message?: string;
  code?: string;
  name?: string;
};

function getMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return String(err);
}

function getStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as ErrorWithMaybeStatus;
  return e.status ?? e.statusCode;
}

export function mapLlmError(err: unknown): TRPCError {
  // Already a TRPCError — pass through unchanged.
  if (err instanceof TRPCError) return err;

  const msg = getMessage(err);
  const status = getStatus(err);
  const lower = msg.toLowerCase();

  // Rate limit / quota — most common with Groq free tier and OpenRouter.
  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("rate-limit") ||
    lower.includes("too many requests") ||
    lower.includes("tpm") ||
    lower.includes("rpm") ||
    lower.includes("quota")
  ) {
    return new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message:
        "The AI provider rate limit has been reached. Wait a minute and try again, or switch to a different provider in Settings.",
      cause: err,
    });
  }

  // Invalid / missing API key.
  if (
    status === 401 ||
    status === 403 ||
    lower.includes("invalid api key") ||
    lower.includes("invalid_api_key") ||
    lower.includes("incorrect api key") ||
    lower.includes("authentication") ||
    lower.includes("unauthorized")
  ) {
    return new TRPCError({
      code: "UNAUTHORIZED",
      message:
        "The AI provider rejected the API key. Check the key for the selected provider in your environment.",
      cause: err,
    });
  }

  // Context / token length overflow.
  if (
    lower.includes("context length") ||
    lower.includes("context_length") ||
    lower.includes("maximum context") ||
    lower.includes("token limit")
  ) {
    return new TRPCError({
      code: "PAYLOAD_TOO_LARGE",
      message:
        "The request is too large for the selected AI model. Try a shorter prompt or switch to a model with a larger context window.",
      cause: err,
    });
  }

  // Model returned malformed / no JSON (raised from extractJson).
  if (
    lower.includes("did not return json") ||
    lower.includes("agent returned invalid json")
  ) {
    return new TRPCError({
      code: "BAD_GATEWAY",
      message:
        "The AI model did not return a valid response. Try rephrasing your request, or switch to a different model in Settings.",
      cause: err,
    });
  }

  // Provider down / network.
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lower.includes("econnreset") ||
    lower.includes("etimedout") ||
    lower.includes("fetch failed")
  ) {
    return new TRPCError({
      code: "BAD_GATEWAY",
      message:
        "Could not reach the AI provider. Check your connection or try again in a moment.",
      cause: err,
    });
  }

  // Fallback: keep the original message but mark as 500.
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: msg || "AI request failed.",
    cause: err,
  });
}

// Wraps an LLM service call so any thrown error is mapped to a TRPCError
// with a user-friendly message before propagating.
export async function runLlm<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw mapLlmError(err);
  }
}
