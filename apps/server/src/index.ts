/**
 * @fileoverview Server entry point.
 *
 * Boots the Express host that serves better-auth at `/api/auth/*` and tRPC at
 * `/api/trpc/*`, injects Mastra-backed AI services into the tRPC context, runs
 * the in-process alert evaluator, and exposes liveness/readiness probes.
 *
 * Boot order (top-to-bottom in this file):
 *   1. dotenv (must run before any module that reads env at import time)
 *   2. REQUIRED_ENV validation — throws on missing keys
 *   3. helmet + HTTPS redirect + CORS
 *   4. Rate limiters (auth / api / otp) and per-account login lockout shim
 *   5. better-auth handler
 *   6. tRPC handler with TRPCServices injection
 *   7. /health (public) and /health/ready (internal-IP gated)
 *   8. startAlertEvaluator
 *   9. SIGTERM/SIGINT graceful shutdown
 *
 * See ARCHITECTURE.md §6 for the full request lifecycle and §8 for the auth
 * model.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
// dotenv must load before any subsequent import that reads process.env at
// module-evaluation time (e.g. ./mastra → ./mastra/model).
config({ path: resolve(__dirname, "../../../.env") });

import { createRequire } from "node:module";
import express from "express";
import type { Request, RequestHandler } from "express";
import cors from "cors";

// helmet@8 and express-rate-limit@7 publish their callable via CJS
// `module.exports` (`export = helmet`). Going through createRequire bypasses
// TypeScript's synthetic-default-import machinery, which needs
// `esModuleInterop` AND consistent module-resolution semantics across build
// environments. Vercel's isolated tsc invocation evidently doesn't honor it
// reliably, so we sidestep the whole issue.
const cjsRequire = createRequire(import.meta.url);
const helmet = cjsRequire("helmet") as (options?: Record<string, unknown>) => RequestHandler;
const rateLimit = cjsRequire("express-rate-limit") as (options?: Record<string, unknown>) => RequestHandler;
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter, createTRPCContext, type TRPCServices } from "@finatalk/trpc";
import { startAlertEvaluator } from "@finatalk/trpc/alerts";
import { auth, checkAccountLockout, recordFailedLogin, clearFailedLogins } from "@finatalk/trpc/auth";
import { toNodeHandler } from "better-auth/node";
import { logger } from "./logger";
import {
  summarizeChart,
  chatWithAdvisor,
  chatWithPortfolioAdvisor,
  generateAnalysisForSymbol,
  generatePortfolioFromPrompt,
  chatWithResearchAdvisor,
  chatWithScenarioPlanner,
  chatWithTaxAdvisor,
  generateMorningBriefing,
  chatWithMarketAdvisor,
} from "./mastra";

const REQUIRED_ENV = ["APP_URL", "DATABASE_URL", "BETTER_AUTH_URL", "BETTER_AUTH_SECRET", "ENCRYPTION_KEY"] as const;
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT ?? 3010);

const app = express();
// TRUST_PROXY controls how Express derives req.ip behind reverse proxies.
// Set to the number of proxy hops (e.g. "1" for a single ALB), a subnet, or
// "loopback" in dev. Over-trusting lets attackers spoof X-Forwarded-For and
// bypass rate limits; under-trusting collapses all users to the proxy IP.
app.set("trust proxy", process.env.TRUST_PROXY ?? "loopback");

if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] === "http") {
      res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
      return;
    }
    next();
  });
}

const cspConnectSrc = ["'self'", process.env.VITE_API_URL ?? ""].filter(Boolean);

app.use(helmet({
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xContentTypeOptions: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://api.dicebear.com"],
      fontSrc: ["'self'"],
      connectSrc: cspConnectSrc,
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
}));

app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});

const allowedOrigins = (process.env.APP_URL ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.startsWith("http"))
  .flatMap((o) => [o, o.replace("://", "://www.")]);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// Tight bucket for credential mutations (sign-in, sign-up, password reset).
// 100 / 15 min is enough for legit users but stops brute-force.
// Skips /get-session — it has its own (generous) limiter mounted earlier.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req: Request) => req.path === "/get-session",
});

// Generous bucket for read-only session checks. TanStack Router's
// `defaultPreload: "intent"` calls `authClient.getSession()` on every hover,
// so a normal browsing session fires this dozens of times per minute.
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: isProduction ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts, please try again later." },
});

// ── Better Auth ───────────────────────────────────────────────────────────
// Read-only session check gets its own (generous) limiter and is mounted
// BEFORE the strict authLimiter — express runs middleware in registration
// order, so this prefix wins for /api/auth/get-session.
app.use("/api/auth/get-session", sessionLimiter);

app.use("/api/auth/two-factor/send-otp", otpLimiter);
app.use("/api/auth/two-factor/verify-otp", otpLimiter);
app.use("/api/auth/two-factor/verify-totp", otpLimiter);
app.use("/api/auth/email-verification", otpLimiter);

// Per-account lockout on sign-in (DB-backed; survives restarts, shared across instances)
app.use("/api/auth/sign-in/email", express.json(), async (req, res, next) => {
  const email = (req.body as { email?: string } | undefined)?.email?.toLowerCase();
  if (email) {
    try {
      await checkAccountLockout(email);
    } catch {
      res.status(429).json({ error: { message: "Account temporarily locked. Please try again later." } });
      return;
    }
  }
  const origEnd = res.end.bind(res);
  res.end = function (...args: Parameters<typeof origEnd>) {
    if (email) {
      if (res.statusCode >= 400) {
        recordFailedLogin(email).catch((err) => logger.error({ err }, "recordFailedLogin failed"));
      } else {
        clearFailedLogins(email).catch((err) => logger.error({ err }, "clearFailedLogins failed"));
      }
    }
    return origEnd(...args);
  } as typeof res.end;
  next();
});

app.use("/api/auth", authLimiter, toNodeHandler(auth));

// ── tRPC ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// tRPC's batch link groups all queries fired in the same tick into one HTTP
// request. Pages like the dashboard home (one query per portfolio via
// `useQueries`) easily reach 20+, so this floor is set well above realistic
// usage but still bounds an abusive client to one big request.
const MAX_TRPC_BATCH = 50;
app.use("/api/trpc", (req, res, next) => {
  const procedures = (req.path.split("/").pop() ?? "").split(",");
  if (procedures.length > MAX_TRPC_BATCH) {
    res.status(400).json({ error: `Batch too large (max ${MAX_TRPC_BATCH})` });
    return;
  }
  next();
});

app.use("/api/trpc", apiLimiter);

// CSRF protection: require custom header
app.use("/api/trpc", (req, res, next) => {
  if (req.method !== "OPTIONS" && req.headers["x-trpc-source"] !== "myapp-web") {
    res.status(403).json({ error: "Missing required header" });
    return;
  }
  next();
});

app.use("/api/trpc", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// Dedupe set for expected/client-side tRPC errors. Cleared every hour so a
// configuration change (e.g. enabling OpenBB) is reflected within an hour
// without restarting the server.
const loggedClientErrors = new Set<string>();
setInterval(() => loggedClientErrors.clear(), 60 * 60 * 1000).unref();

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: (opts) =>
      createTRPCContext(opts, {
        // Cast every service through NonNullable<TRPCServices[...]> to pin
        // the type at the boundary. zod's inference has subtle differences
        // between the local build and Vercel's strict tsc invocation
        // (`description?: string` instead of `description: string`, etc.).
        // The runtime contract is identical; only the inferred types drift.
        summarizeChart: summarizeChart as NonNullable<TRPCServices["summarizeChart"]>,
        chatWithAdvisor: chatWithAdvisor as NonNullable<TRPCServices["chatWithAdvisor"]>,
        chatWithPortfolioAdvisor: chatWithPortfolioAdvisor as NonNullable<TRPCServices["chatWithPortfolioAdvisor"]>,
        generateAnalysis: generateAnalysisForSymbol as NonNullable<TRPCServices["generateAnalysis"]>,
        generatePortfolio: generatePortfolioFromPrompt as NonNullable<TRPCServices["generatePortfolio"]>,
        chatWithResearch: chatWithResearchAdvisor as NonNullable<TRPCServices["chatWithResearch"]>,
        chatWithScenarioPlanner: chatWithScenarioPlanner as NonNullable<TRPCServices["chatWithScenarioPlanner"]>,
        chatWithTaxAdvisor: chatWithTaxAdvisor as NonNullable<TRPCServices["chatWithTaxAdvisor"]>,
        generateBriefing: generateMorningBriefing as NonNullable<TRPCServices["generateBriefing"]>,
        chatWithMarketAdvisor: chatWithMarketAdvisor as NonNullable<TRPCServices["chatWithMarketAdvisor"]>,
      }),
    onError({ path, error }) {
      // PRECONDITION_FAILED = feature disabled by config (e.g. OpenBB sidecar
      // not deployed), TOO_MANY_REQUESTS = rate-limited LLM, etc. None of
      // these are bugs, so log them at info instead of error.
      const expected = new Set([
        "UNAUTHORIZED",
        "FORBIDDEN",
        "BAD_REQUEST",
        "NOT_FOUND",
        "TOO_MANY_REQUESTS",
        "CONFLICT",
        "PRECONDITION_FAILED",
        "PAYLOAD_TOO_LARGE",
      ]);
      if (expected.has(error.code)) {
        // Dedupe by (code,message) only — not path — so a single message like
        // "OpenBB is not enabled" logs once per hour even though it's thrown
        // from a dozen different procedures.
        const key = `${error.code}|${error.message}`;
        if (!loggedClientErrors.has(key)) {
          loggedClientErrors.add(key);
          logger.info({ path, code: error.code, message: error.message }, "tRPC client error");
        }
      } else {
        logger.error({ path, code: error.code, message: error.message, stack: error.stack }, "tRPC error");
      }
    },
  }),
);

// Liveness: public, no dependencies — for load-balancer probes.
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Readiness: reports dependency status — gated so it can only be reached from
// internal networks. Operators expose /health/ready at the ingress level or
// via a private health-check route, never publicly.
app.get("/health/ready", async (req, res) => {
  const ip = req.ip ?? "";
  const isInternal =
    ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") ||
    ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
  if (!isInternal) {
    res.status(404).end();
    return;
  }
  let openbb: boolean | null = null;
  if (process.env.OPENBB_ENABLED === "true" && process.env.OPENBB_BASE_URL) {
    const { getOpenBBClient } = await import("@finatalk/openbb");
    openbb = await getOpenBBClient().isHealthy().catch(() => false);
  }
  res.json({ status: "ok", timestamp: new Date().toISOString(), openbb });
});

const server = app.listen(PORT, () => {
  logger.info(`Finatalk server running on http://localhost:${PORT}`);
});

const stopAlertEvaluator = startAlertEvaluator((err) => {
  logger.error({ err }, "alert evaluator failed");
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  stopAlertEvaluator();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
