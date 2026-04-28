# Finatalk — Architecture

This document is the maintenance map of Finatalk. It explains *what lives where*,
*how requests flow*, and *why* the non-obvious bits are shaped the way they are.
Read [README.md](README.md) first if you only want to run or deploy the app —
this doc assumes you already know that and want to understand or change it.

---

## 1. High-level architecture

Finatalk is a TypeScript pnpm monorepo with four runtime tiers:

```
            ┌──────────────────────────────────────────────┐
 Browser →  │  apps/web         React 19 + Vite + TanRouter │
            └──────────────────────────────────────────────┘
                             │  HTTPS / tRPC (JSON + superjson)
                             │  same-origin via Vercel rewrite /api/*
                             ▼
            ┌──────────────────────────────────────────────┐
            │  apps/server      Express + better-auth       │
            │                   tRPC v11 + Mastra agents    │
            │                   Alert evaluator (setInterval)│
            └──────────────────────────────────────────────┘
                 │                          │
                 │ Drizzle / postgres-js    │ HTTP
                 ▼                          ▼
            ┌──────────────┐      ┌──────────────────────────┐
            │  Postgres    │      │  services/openbb (Python) │
            │  (Neon prod, │      │  OpenBB Platform REST     │
            │   Docker dev)│      │  → FMP, FRED, Yahoo, …   │
            └──────────────┘      └──────────────────────────┘
                                             │
                              fallback ↘     │
                                       Yahoo Finance (yahoo-finance2)
```

Sharing happens through `packages/`:

- [`packages/db`](packages/db) — Drizzle schema and the singleton DB client.
- [`packages/trpc`](packages/trpc) — every router, the auth wiring, the alert
  evaluator, the market-data fallback layer, and shared Zod schemas.
- [`packages/openbb`](packages/openbb) — typed wrapper around the OpenBB sidecar.

Both `apps/web` and `apps/server` import from `@finatalk/trpc` (the web app
imports only the `AppRouter` *type* — implementation stays server-side).

---

## 2. Repository layout

```
finatalk/
├── apps/
│   ├── web/                React SPA, Vite, TanStack Router file-based routes
│   └── server/             Express host for tRPC + better-auth + Mastra agents
├── packages/
│   ├── db/                 Drizzle ORM schema (8 tables) + Postgres client
│   ├── trpc/               14 tRPC routers, auth, alerts, market provider
│   └── openbb/             OpenBB Platform REST client (TypeScript)
├── services/
│   └── openbb/             Python sidecar wrapping OpenBB Core (Uvicorn)
├── infra/
│   └── docker-compose.yml  Local Postgres + OpenBB
├── Dockerfile              Server image (Fly.io)
├── fly.toml                Server deploy config
├── vercel.json             Frontend deploy config (with /api/* rewrite)
├── turbo.json              Monorepo build pipeline (build / typecheck / dev)
├── tsconfig.base.json      Strict TS settings shared by every package
├── pnpm-workspace.yaml     apps/* + packages/*
└── .env.example            Full list of required + optional env vars
```

The `finatalk_` table prefix in `packages/db/src/schema/auth.ts:4` lets multiple
apps share a database without colliding.

---

## 3. Deployment topology

Three providers, intentionally split:

| Tier        | Where        | Why                                                                                                                                   |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend    | **Vercel**   | Static Vite build. `/api/*` is rewritten to the Fly backend ([vercel.json](vercel.json)) so the browser sees same-origin requests.    |
| Backend     | **Fly.io**   | The server holds long-running state — `setInterval` alert evaluator, DB connection pool, in-memory caches — that won't fit serverless.|
| Database    | **Neon**     | Managed Postgres, free tier. SSL is required (`?sslmode=require`).                                                                    |

The Fly machine is `shared-cpu-1x` / 512 MB with `min_machines_running = 1`
([fly.toml](fly.toml)). `tsx` transpiles TypeScript at runtime ([Dockerfile](Dockerfile))
so there is no build step in the image; `NODE_OPTIONS=--max-old-space-size=384`
caps V8 below the machine limit.

---

## 4. Request lifecycle (a tRPC call, end to end)

1. **Browser** — `apps/web/src/lib/trpc.ts` builds a `httpBatchLink` against
   `${origin}/api/trpc`, sets `x-trpc-source: myapp-web`, and includes cookies
   (`credentials: "include"`).
2. **Vercel rewrite** — [vercel.json](vercel.json) forwards `/api/*` to
   `https://finatalk-server.fly.dev/api/*` (configured per environment).
3. **Express middleware chain** ([apps/server/src/index.ts](apps/server/src/index.ts)) — in order:
   - `helmet` security headers + CSP.
   - HTTPS redirect in production.
   - CORS allowing only `APP_URL` (comma-separated).
   - Rate limit: `apiLimiter` 200/min for `/api/trpc`, `authLimiter` 100/15min
     for `/api/auth`, `otpLimiter` 10/5min for OTP endpoints.
   - **CSRF check**: requires the `x-trpc-source: myapp-web` header. Drops
     anything else with 403 because browsers can't set custom headers on
     cross-site form posts.
   - Batch cap: max 20 procedures per tRPC batch.
4. **tRPC context** ([packages/trpc/src/context.ts](packages/trpc/src/context.ts)) —
   `createTRPCContext` resolves the better-auth session from the cookie, attaches
   `db`, `req`, `res`, and the AI service callbacks (`summarizeChart`,
   `chatWithAdvisor`, …). The AI services are *injected* by the server; the
   tRPC package itself has no dependency on Mastra.
5. **Procedure runs** — `protectedProcedure`
   ([packages/trpc/src/trcp.ts](packages/trpc/src/trcp.ts)) enforces auth and
   (when `EMAIL_VERIFICATION=on`) email verification before the body executes.
6. **Response** — superjson re-serialises Date/BigInt/Map. Cache-Control is
   forced to `no-store` for every tRPC response.

The frontend's `QueryClient` ([apps/web/src/main.tsx](apps/web/src/main.tsx))
catches `UNAUTHORIZED` errors via `QueryCache.onError` and redirects to `/login`
once, guarding against redirect loops with the `redirectingToLogin` flag.

---

## 5. apps/web (frontend)

Stack: React 19, Vite 5, TanStack Router (file-based), TanStack Query, tRPC
React, Tailwind v4, Radix UI primitives, lightweight-charts, i18next, Zod, sonner.

Key entry points:

- [apps/web/src/main.tsx](apps/web/src/main.tsx) — React root. Wires
  `I18nextProvider`, `trpc.Provider`, `QueryClientProvider`, `RouterProvider`,
  `Toaster`. Defines the global session-expiry redirect.
- [apps/web/src/lib/trpc.ts](apps/web/src/lib/trpc.ts) — `trpc` (React hooks)
  and `trpcClient` (vanilla). Pinpoints the API origin: same-origin in the
  browser, `VITE_API_URL` during SSR/tests.
- [apps/web/src/lib/auth-client.ts](apps/web/src/lib/auth-client.ts) — better-auth
  client with the two-factor plugin. Re-exports `useSession`, `signIn`, etc.
- [apps/web/src/routeTree.gen.ts](apps/web/src/routeTree.gen.ts) —
  **auto-generated** by `pnpm gen:routes`; never hand-edit. Re-run when adding
  or moving a route file.

Routing:

- File-based routes live in `apps/web/src/routes/`.
- The `_auth` segment is the gate for logged-in pages (`_auth/dashboard`, etc.).
- Public flows (`login.tsx`, `sign-up.tsx`, `verify-email.tsx`,
  `setup-2fa.tsx`, `two-factor.tsx`) sit at the top level.

Client-side persistence:

- `apps/web/src/lib/use-versioned-state.ts` and `versioned-storage.ts`
  implement debounced, schema-versioned localStorage state. Bumping the
  `version` number forces a fresh state on next load (used for
  analyses, portfolios, comparisons, backtests, screener filters).

Charting + indicators:

- `apps/web/src/lib/use-lightweight-chart.ts` is the React hook around
  TradingView's lightweight-charts. Indicator overlays come from
  `indicator-defaults.ts` and `indicator-legend.ts`.

Backtesting (runs entirely in the browser):

- `apps/web/src/lib/backtest-engine.ts` implements `runBacktest`,
  `runSweep`, and `runPortfolio`. It consumes `RouterOutputs["market"]["analyze"]`
  (so the same indicator series the chart shows is the one the backtester sees).
  Strategies live in `strategy-signals.ts`; their indicator presets are
  declared in `BACKTEST_STRATEGY_INDICATORS`.

i18n: English + French ([apps/web/src/lib/i18n.ts](apps/web/src/lib/i18n.ts)).
Every AI agent honours the user's `language` parameter.

---

## 6. apps/server (backend)

[apps/server/src/index.ts](apps/server/src/index.ts) is the entire startup
sequence — middleware, lockout shim, tRPC mount, health checks, alert evaluator,
graceful shutdown.

Boot order:

1. `dotenv` loads `.env` from the repo root (line 5) — must happen before any
   import that reads `process.env` at module scope.
2. `REQUIRED_ENV` validation. Missing keys throw before listening.
3. `app.set("trust proxy", …)` — set this correctly in production. Over-trusting
   lets attackers spoof `X-Forwarded-For` and bypass the rate limiters;
   under-trusting collapses every user to the proxy IP.
4. helmet, HTTPS redirect, CORS.
5. Per-account login lockout shim: intercepts `/api/auth/sign-in/email`,
   reads the email out of the JSON body, wraps `res.end` so failed attempts
   call `recordFailedLogin` and successes call `clearFailedLogins`. Lockout
   state lives in the `loginAttempt` table — durable and shared across
   instances. See `packages/trpc/src/auth.ts:135-198`.
6. better-auth handler at `/api/auth/*`.
7. tRPC handler at `/api/trpc` with the AI service callbacks injected.
8. `/health` (public, dependency-free) and `/health/ready` (internal-IP gated;
   queries the OpenBB sidecar when configured).
9. `startAlertEvaluator` — see §10.
10. SIGTERM/SIGINT → stop the evaluator → close the HTTP server → exit; a 10s
    fallback `setTimeout` forces exit if the close hangs.

### Why `createRequire` for helmet and yahoo-finance2

Both modules ship CommonJS. Vercel's strict `tsc` invocation occasionally
miscompiles the synthetic-default-import path even with `esModuleInterop`,
producing runtime "X is not a function". Going through `createRequire` (see
[apps/server/src/index.ts:18](apps/server/src/index.ts#L18) and
[packages/trpc/src/lib/market-provider.ts:28](packages/trpc/src/lib/market-provider.ts#L28))
sidesteps the problem; behaviour is identical at runtime.

---

## 7. packages/trpc (the brain)

Layout:

```
packages/trpc/src/
├── trcp.ts             initTRPC + protectedProcedure (auth + email gate)
├── context.ts          TRPCServices types + createTRPCContext
├── router.ts           14 sub-routers stitched into appRouter
├── auth.ts             better-auth setup, encryption adapter, lockout helpers
├── crypto.ts           AES-256-GCM helper (versioned, env-driven)
├── routers/            user, market, portfolio, analysis, ai, research,
│                       news, rates, learning, notification, watchlist,
│                       screener, template, alert
├── lib/
│   ├── market-provider.ts   OpenBB → Yahoo fallback for chart, FX, quotes
│   ├── openbb-helpers.ts    small wrappers
│   ├── pdf-report.ts        PDFKit report generation
│   ├── llm-errors.ts        AI error formatting
│   └── wikipedia-constituents.ts  fallback index member fetch
├── alerts/evaluator.ts      setInterval-driven price/indicator evaluator
├── schemas/
│   ├── indicator.ts         Zod for ranges, intervals, indicators
│   ├── portfolio.ts
│   └── common.ts
├── indicators/primitives.ts technical indicator math (RSI, MACD, BBands, ADX, …)
├── constants/alerts.ts      AlertConditionType + parameter schemas
└── market/exchanges.ts      symbol → exchange suffix mapping
```

### Service injection

`TRPCServices` ([packages/trpc/src/context.ts](packages/trpc/src/context.ts)) is
a record of optional callbacks. `apps/server` passes the Mastra-backed
implementations; tests can pass stubs. The trpc package therefore never depends
on Mastra or any AI SDK — that keeps the package buildable on Vercel where the
server-only deps aren't installed.

`apps/server/src/index.ts:202-211` casts each service through
`NonNullable<TRPCServices[…]>`. The cast is a bandage for Zod's inference
drifting between local `tsc` and Vercel's stricter invocation
(`description?: string` vs `description: string`). The runtime contract is
identical; only the inferred types disagree.

### protectedProcedure

```ts
protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) throw UNAUTHORIZED;
  if (EMAIL_VERIFICATION === "on" && !ctx.user.emailVerified) throw FORBIDDEN;
  return next({ ctx: { ...ctx, session, user } });
});
```

The `next` call narrows `session` and `user` to non-null in the procedure body.
Default to `protectedProcedure`; use `publicProcedure` only for endpoints that
must work without a session (e.g. nothing in the current router set).

### Adding a router

1. Create `packages/trpc/src/routers/foo.ts` exporting `fooRouter`.
2. Import + register in `packages/trpc/src/router.ts`.
3. The web app picks it up automatically through the `AppRouter` type export.

---

## 8. Authentication & security

### Stack

- **better-auth v1.2** ([packages/trpc/src/auth.ts](packages/trpc/src/auth.ts))
  with the Drizzle adapter.
- Email + password (12–128 chars, must contain upper/lower/digit/symbol).
- Email verification (opt-in via `EMAIL_VERIFICATION=on`).
- TOTP and email-OTP via the `twoFactor` plugin.
- OAuth providers slot into `socialProviders` (currently empty).

### Session cookies

- Prefix `myapp`, `httpOnly`, `sameSite=lax`, `secure` in production.
- `expiresIn: 3600`, refreshed every 5 minutes.
- 30-second cookie cache to reduce DB hits.

### Encryption-at-rest adapter

`withCustomAdapter` in [packages/trpc/src/auth.ts:50](packages/trpc/src/auth.ts#L50)
wraps the Drizzle adapter and transparently encrypts sensitive fields:

| Model      | Fields encrypted                              |
| ---------- | --------------------------------------------- |
| `twoFactor`| `secret`, `backupCodes`                       |
| `account`  | `accessToken`, `refreshToken`, `idToken`      |

Format: `enc:v1:<iv-hex>:<tag-hex>:<ciphertext-hex>`. The version prefix lets
us roll keys: set `ENCRYPTION_KEY_V2` and bump `CURRENT_KEY_VERSION` in
[packages/trpc/src/crypto.ts](packages/trpc/src/crypto.ts) — old rows decrypt
with V1, new writes use V2. Algorithm is AES-256-GCM with random 12-byte IVs.

### Account lockout (DB-backed)

- 5 failed sign-ins within 15 minutes ⇒ account locked for 15 minutes.
- Stored in the `loginAttempt` table → survives restarts and is shared across
  instances. (An in-memory counter would lock per-machine only.)
- `recordFailedLogin` upserts atomically; the SQL `CASE` clause re-arms the
  lockout when the count first crosses the threshold.
- Stale rows are swept every 10 minutes. Sweeps fail-open.

### CSRF

The `/api/trpc` middleware requires `x-trpc-source: myapp-web`
([apps/server/src/index.ts:178](apps/server/src/index.ts#L178)). Browsers
forbid setting custom headers on cross-site form submissions, so this header
acts as a CSRF token without needing per-request tokens. Same idea as
GitHub's `X-Requested-With` check.

### Rate limits

| Scope              | Window  | Max (prod) | Max (dev) |
| ------------------ | ------- | ---------- | --------- |
| `/api/auth/*`      | 15 min  | 100        | 500       |
| `/api/trpc/*`      | 1 min   | 200        | 200       |
| 2FA / verification | 5 min   | 10         | 500       |

---

## 9. Database (`packages/db`)

[packages/db/src/client.ts](packages/db/src/client.ts) creates a single
`postgres-js` client with `prepare: false` (Drizzle generates parameterised
queries directly). Pool defaults: `max=20`, idle 30 s, connect 10 s,
max-lifetime 30 min.

`resolveSsl()` resolves TLS in this order:

1. `DB_SSL=true` → strict TLS (`rejectUnauthorized: true`).
2. `DB_SSL=false` → plain TCP (only safe for localhost).
3. URL has `sslmode=require|verify-ca|verify-full` → `"require"`.
4. URL has `sslmode=disable` → `false`.
5. Otherwise → `"prefer"` (best for "works locally and against Neon without
   per-env config").

### Schema (`packages/db/src/schema/`)

Every table is created with `pgTableCreator((name) => "finatalk_" + name)` so
the namespace is collision-safe.

| File              | Tables                                                                               |
| ----------------- | ------------------------------------------------------------------------------------ |
| `auth.ts`         | `user`, `session`, `account`, `verification`, `twoFactor` (better-auth contract)     |
| `login-attempt.ts`| `loginAttempt` — per-email counter + `lockedUntil`                                   |
| `portfolio.ts`    | `portfolio`, `holding`, `transaction`, `eventCache`, `template`, `templateTag`       |
| `analysis.ts`     | saved technical analyses (indicator snapshots, optional description)                 |
| `research.ts`     | saved SEC/research conversations and documents                                       |
| `notification.ts` | user notifications (alerts, system messages)                                         |
| `watchlist.ts`    | per-user symbol watchlists                                                           |
| `learning.ts`     | learning-track progress                                                              |

Migrations live in `packages/db/migrations/` and are managed by Drizzle Kit:

```bash
pnpm db:generate   # turn schema diffs into a SQL migration
pnpm db:migrate    # apply migrations against DATABASE_URL
pnpm db:studio     # open a local UI to browse tables
```

When you change a schema file: bump types, regenerate, commit both the schema
edit and the new SQL migration.

---

## 10. Market data pipeline

```
runAnalysis(symbol, range, interval, indicators, convertTo)
    │
    ├─► fetchChartWithFallback   (lib/market-provider.ts)
    │     ├─ if isOpenBBEnabled() → OpenBBClient.getHistoricalPrice
    │     └─ on error / empty   → yahoo-finance2.chart
    │
    ├─► fetchFxRatesWithFallback (when convertTo is set)
    │     └─ map { time → fxClose } and convert candles
    │
    └─► indicator runners (packages/trpc/src/indicators/primitives.ts)
          via the trading-signals npm package + custom math
```

`isOpenBBEnabled()` ([packages/openbb/src/index.ts](packages/openbb/src/index.ts))
checks `OPENBB_BASE_URL` is set *and* `OPENBB_ENABLED !== "false"`. Default-on
when configured.

The OpenBB sidecar ([services/openbb/start.py](services/openbb/start.py)) is a
Python process that:

1. Reads provider credentials (FMP, FRED, Benzinga, …) from `.env`.
2. Writes them to `~/.openbb_core/user_settings.json`.
3. Starts Uvicorn on port `6900` (default).

The OpenBB client ([packages/openbb/src/client.ts](packages/openbb/src/client.ts))
hits `${OPENBB_BASE_URL}/api/v1/...`, unwraps `{ results: [...] }`, and maps
each provider's snake_case fields to camelCase TypeScript types in
[packages/openbb/src/types.ts](packages/openbb/src/types.ts). Errors throw an
`OpenBBError` carrying the upstream status and path.

The fallback chain (OpenBB → Yahoo) is intentional: OpenBB gives us multi-provider
fundamentals and economic data, but Yahoo is more reliable for raw OHLCV. If
OpenBB returns nothing or throws, we silently fall back so the UI degrades
gracefully when the sidecar is down.

---

## 11. AI agents (Mastra)

[apps/server/src/mastra/index.ts](apps/server/src/mastra/index.ts) registers
ten agents and exports the high-level functions injected into the tRPC context.

| Agent                         | Function exported                  | Purpose                                                       |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `chartSummaryAgent`           | `summarizeChart`                   | One-paragraph summary of an analysed chart                    |
| `chartAdvisorAgent`           | `chatWithAdvisor`                  | Chat grounded in the active chart + indicators                |
| `portfolioAdvisorAgent`       | `chatWithPortfolioAdvisor`         | Chat grounded in a portfolio's holdings                       |
| `analysisGeneratorAgent`      | `generateAnalysisForSymbol`        | Pick indicators + write title/description (structured JSON)   |
| `portfolioGeneratorAgent`     | `generatePortfolioFromPrompt`      | Build a draft portfolio from a free-text prompt               |
| `researchAdvisorAgent`        | `chatWithResearchAdvisor`          | SEC EDGAR / fundamentals chat with citations                  |
| `scenarioPlannerAgent`        | `chatWithScenarioPlanner`          | What-if scenarios on a portfolio                              |
| `taxAdvisorAgent`             | `chatWithTaxAdvisor`               | Tax-aware portfolio commentary across account types           |
| `morningBriefingAgent`        | `generateMorningBriefing`          | Daily briefing covering portfolios + watchlist                |
| `marketAdvisorAgent`          | `chatWithMarketAdvisor`            | General market chat                                           |

### Model selection

[apps/server/src/mastra/model.ts](apps/server/src/mastra/model.ts) exposes
`getLargeModel()` and `getSmallModel()`. Both are *lazy* — env vars are
resolved on first call, not at module evaluation, because dotenv is loaded
inside `apps/server/src/index.ts` and ESM hoisting would otherwise read the
env before dotenv runs.

`AI_PROVIDER` switches between `anthropic` (default), `openai`, `groq`,
`gemini`, `openrouter`, `github`, `ollama`. Each has DEFAULTS for the large
and small models; override with `AI_MODEL_LARGE` / `AI_MODEL_SMALL`.

Provider-specific gotchas baked into `createProviderModel`:

- **Ollama** — uses `.chat()` (Chat Completions), not `/responses`. Injects
  `think: false` via a custom `fetch` so reasoning models return only the
  final answer.
- **GitHub Models** — OpenAI-compatible at `/inference`; PAT scope `models:read`.
  `.chat()` is required.
- **OpenRouter** — OpenAI-compatible at `/api/v1`; only Chat Completions, not
  Responses. Adds `HTTP-Referer` and `X-Title` headers for analytics.

### Tools

[apps/server/src/mastra/tools/](apps/server/src/mastra/tools/) — agents call
these to fetch live data:

| File                  | What it exposes                                                            |
| --------------------- | -------------------------------------------------------------------------- |
| `advisor-tools.ts`    | quote, dividend, earnings, fundamentals, options                            |
| `indicator-tools.ts`  | `listAvailableIndicators`, `analyzeSymbol`                                  |
| `sec-tools.ts`        | SEC EDGAR filing search/fetch ([providers/sec-edgar.ts](apps/server/src/providers/sec-edgar.ts)) |
| `symbol-tools.ts`     | symbol search, index constituents                                          |

### Snapshot building

`buildSnapshot` in `apps/server/src/mastra/index.ts:35` trims OHLC bars to the
last `MAX_BARS = 60`, rounds floats to 4 decimals, and includes the tail of
each indicator's series — small enough for the prompt context budget while
preserving the most recent price action.

### Conversation trimming

`trimHistory` (line 119) keeps at most 30 messages and 50 000 chars. This
matters when a portfolio chat keeps going for days; the older context is
dropped before sending to the model.

### Adding a new agent

1. Create `apps/server/src/mastra/agents/foo.ts` exporting a `Mastra` `Agent`.
2. Register it in `apps/server/src/mastra/index.ts` (the `agents:` block + an
   exported function that calls `.generate(...)`).
3. Add a service type to `packages/trpc/src/context.ts:TRPCServices`.
4. Wire it in `apps/server/src/index.ts:202-211`.
5. Expose a tRPC procedure in `packages/trpc/src/routers/ai.ts` that calls
   `ctx.services.foo`.

---

## 12. Alert evaluator

[packages/trpc/src/alerts/evaluator.ts](packages/trpc/src/alerts/evaluator.ts)
runs in-process on the server.

- **Tick interval**: 5 minutes (`TICK_INTERVAL_MS`).
- **Cooldown**: 6 hours per alert after firing (`COOLDOWN_MS`).
- **Re-entrancy**: a `running` flag drops a tick if the previous one is still
  in flight. Long DB stalls won't pile up overlapping evaluations.
- **Symbol batching**: alerts are grouped by symbol so we make one chart fetch
  per symbol per tick, not one per alert.
- **Conditions** — supported `AlertConditionType`s:
  `price_above`/`price_below`, `pct_change_24h_up`/`down`,
  `ma_cross_up`/`down`, `macd_cross_up`/`down`,
  `rsi_above`/`below`, `adx_above`,
  `bb_upper_break`/`bb_lower_break`,
  `breakout_high`/`breakout_low`,
  `drawdown_from_high`, `volume_spike`.
- **Fired alerts** insert a row into `notification` and stamp `triggeredAt`
  on the alert; the cooldown then suppresses re-firing.

Because this is `setInterval`-based and stateful, the server must stay running
— hence Fly's `min_machines_running = 1`. A serverless deployment would
silently miss alerts.

---

## 13. Configuration

`.env.example` is the source of truth. Required for the server to boot:

| Variable             | Notes                                                           |
| -------------------- | --------------------------------------------------------------- |
| `APP_URL`            | Comma-separated origins for CORS + better-auth trust list.      |
| `DATABASE_URL`       | Postgres connection string. Append `?sslmode=require` for Neon. |
| `BETTER_AUTH_URL`    | Public URL the auth handler reflects in cookies.                |
| `BETTER_AUTH_SECRET` | 32-byte hex (`openssl rand -hex 32`).                           |
| `ENCRYPTION_KEY`     | 32-byte hex; rotates via `ENCRYPTION_KEY_V2`, `_V3`, …          |

Optional:

| Variable                                                | Effect                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `EMAIL_VERIFICATION=on`                                 | Require email verification before login.                            |
| `RESEND_API_KEY`                                        | Send verification + OTP emails. Without it, emails are logged only. |
| `EMAIL_FROM`                                            | `From:` address (defaults to `onboarding@resend.dev`).              |
| `AI_PROVIDER` + provider key                            | See §11.                                                            |
| `OPENBB_ENABLED=true` + `OPENBB_BASE_URL`               | Route market data through the sidecar.                              |
| `OPENBB_FMP_API_KEY` etc.                               | Provider credentials forwarded to the sidecar.                      |
| `DB_SSL`, `DB_POOL_MAX`                                 | Override defaults (§9).                                             |
| `TRUST_PROXY`                                           | `1`/`true`/CIDR for Fly/ALB; `loopback` in dev.                     |
| `VITE_API_URL`                                          | Frontend API origin during SSR/tests (browser uses same-origin).    |

---

## 14. Build & dev pipeline

- **Package manager**: pnpm 9 (`pnpm-workspace.yaml`).
- **Orchestrator**: turbo 2 (`turbo.json`). `dev` is `persistent: true`,
  `build` depends on `^build` and caches `dist/**`.
- **Frontend build**: `pnpm --filter @finatalk/web build` runs
  `tsc → tanstack-router-cli generate → vite build`.
- **Backend "build"**: there isn't one. The Fly image runs
  `pnpm --filter @finatalk/server exec tsx src/index.ts`; tsx compiles on import.
  Pros: tiny Dockerfile, fast deploys. Cons: every cold start parses the source
  tree once. Acceptable on a long-running machine.
- **Type checking**: `pnpm typecheck` runs each package's `tsc --noEmit`.
- **Tests**: Vitest in `apps/web/src/lib/*.test.ts`. Add `vitest run` to CI
  before deploying. There are currently no backend tests.

`tsconfig.base.json` enables `strict`, `exactOptionalPropertyTypes`,
`noUncheckedIndexedAccess`, `module: ESNext`, `moduleResolution: bundler`. New
code must compile under those — they catch a lot of "is this nullable or not"
bugs that other repos let through.

---

## 15. Cookbook — common changes

**Add a tRPC procedure**

1. Pick or create the right file under `packages/trpc/src/routers/`.
2. Export it from the existing router (`createTRPCRouter({ ... })`).
3. The frontend can call it immediately as `trpc.myRouter.myProcedure.useQuery()`.

**Add a database table**

1. Add a new file or table in `packages/db/src/schema/`.
2. Re-export from `packages/db/src/schema/index.ts` if it's a new file.
3. `pnpm db:generate` → review the generated SQL → `pnpm db:migrate`.
4. Use it in routers via `db.<tableName>` (Drizzle exposes the schema namespace).

**Add a frontend route**

1. Drop a file under `apps/web/src/routes/`. Filenames map to URLs (TanStack
   Router conventions: `_auth.tsx` is a layout, `_auth.dashboard.tsx` a child).
2. `pnpm --filter @finatalk/web gen:routes` (or rely on the `dev` watcher).
3. Auth-gated routes belong under `_auth/`.

**Add an AI agent**

See §11 → "Adding a new agent".

**Switch AI providers**

Set `AI_PROVIDER` and the matching key in `.env` (or `flyctl secrets set`).
Restart the server. No code change needed — the provider is read on first call
to `getLargeModel()`/`getSmallModel()`.

**Rotate the encryption key**

1. Generate `K2 = $(openssl rand -hex 32)`.
2. Set `ENCRYPTION_KEY_V2=K2` (keep V1 for decrypting old rows).
3. Bump `CURRENT_KEY_VERSION` to 2 in `packages/trpc/src/crypto.ts`.
4. Optional: write a one-shot script that re-encrypts old rows with V2 and
   delete `ENCRYPTION_KEY` once nothing is left at V1.

**Add a new alert condition**

1. Extend `AlertConditionType` in `packages/trpc/src/constants/alerts.ts`.
2. Add a branch in `evaluateCondition`, `currentThresholdValue`, and
   `conditionLabel` in `packages/trpc/src/alerts/evaluator.ts`.
3. Surface it in the alerts UI (`apps/web/src/components/alerts/`).

---

## 16. Operational quick reference

| Concern               | Where to look                                                                |
| --------------------- | ---------------------------------------------------------------------------- |
| Backend logs          | `flyctl logs`                                                                |
| Frontend build/runtime| Vercel dashboard                                                              |
| Memory pressure       | `flyctl scale memory 1024` (default 512 MB; steady ~350–450 MB)              |
| DB introspection      | `pnpm db:studio`                                                             |
| Sidecar health        | `GET /health/ready` (internal IPs only)                                      |
| Account locked out    | `delete from finatalk_login_attempt where email = '…'` or wait 15 min        |
| Rotate auth secret    | `flyctl secrets set BETTER_AUTH_SECRET="$(openssl rand -hex 32)"` → invalidates all sessions |

---

## 17. Where to start when…

- **A symbol won't load** → `packages/trpc/src/lib/market-provider.ts` (fallback
  chain, `isOpenBBEnabled`).
- **An indicator misbehaves** → `packages/trpc/src/indicators/primitives.ts`
  + the relevant case in `packages/trpc/src/routers/market.ts:runAnalysis`.
- **An agent answers wrong** → its instructions in `apps/server/src/mastra/agents/*`
  + the snapshot built in `apps/server/src/mastra/index.ts:buildSnapshot`.
- **Auth bug** → `packages/trpc/src/auth.ts` (sessions, lockout) +
  `apps/server/src/index.ts:130-160` (lockout shim wiring).
- **Alert never fires** → check `enabled` + `triggeredAt` + cooldown in
  `packages/trpc/src/alerts/evaluator.ts:evaluateAlertsOnce`.
- **Encrypted field unreadable** → wrong/missing `ENCRYPTION_KEY[_Vn]`; the
  format is `enc:v<n>:<iv>:<tag>:<ct>`.
- **CSP blocks something** → tweak `cspConnectSrc`/directives in
  `apps/server/src/index.ts:66-87`.
