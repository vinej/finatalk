# Finatalk

A full-stack TypeScript application with a 4-layer architecture:

```text
myapp/
├── apps/
│   ├── web/         # React 19 + Vite + TanStack Router + Tailwind v4
│   └── server/      # Express + better-auth + tRPC v11
└── packages/
    ├── db/          # Drizzle + Postgres
    └── trpc/        # Shared tRPC routers + auth wiring
```

## Quick start

```bash
pnpm install
cp .env.example .env                       # then edit secrets
docker compose -f infra/docker-compose.yml up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open <http://localhost:5173>.

## Scripts

- `pnpm dev` — run web + server in parallel (turbo)
- `pnpm build` — production builds across all packages
- `pnpm db:generate` — generate a new migration from schema changes
- `pnpm db:migrate` — apply migrations to the database
- `pnpm typecheck` — type-check everything

## Environment

See `.env.example` for the required variables. For local dev you can leave
`EMAIL_VERIFICATION=off` and `RESEND_API_KEY=` empty — accounts will be auto-verified.
For production, set `EMAIL_VERIFICATION=on` and provide a Resend API key.

## Deployment

The app is split across two platforms:

- **Frontend** (Vite static build) → **Vercel**
- **Backend** (Express + tRPC + alert evaluator) → **Fly.io**
- **Database** → **Neon** (Postgres, free tier)

The Express server keeps long-running state (`setInterval` alert evaluator,
in-memory caches, DB pool) so it doesn't fit a serverless function. Fly.io's
$5/mo free credit covers a 512 MB always-on machine (~$4/mo).

### 1. Database (Neon)

1. Create a project at <https://neon.tech>.
2. Copy the connection string and append `?sslmode=require` if not present.
3. Apply migrations from your local machine:

   ```bash
   DATABASE_URL="postgres://...?sslmode=require" pnpm db:migrate
   ```

### 2. Backend on Fly.io

Install [flyctl](https://fly.io/docs/flyctl/install/) (Windows: `winget install Fly.Flyctl`,
then restart your shell).

```bash
flyctl auth signup        # or: flyctl auth login
flyctl launch --no-deploy # accept the existing fly.toml when prompted
```

Set required secrets (these are encrypted at Fly):

```bash
flyctl secrets set \
  DATABASE_URL="postgres://...?sslmode=require" \
  BETTER_AUTH_SECRET="$(openssl rand -hex 32)" \
  ENCRYPTION_KEY="$(openssl rand -hex 32)" \
  APP_URL="https://finatalk-server.vercel.app" \
  BETTER_AUTH_URL="https://finatalk-server.fly.dev" \
  EMAIL_VERIFICATION=off
```

Optional secrets (set only what you use): `RESEND_API_KEY`, `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`,
`GITHUB_TOKEN`.

Deploy:

```bash
flyctl deploy
```

Verify: `https://finatalk-server.fly.dev/health` should return JSON with
`{"status":"ok"}`.

The deployment uses:

- [`fly.toml`](fly.toml) — `shared-cpu-1x` machine, 512 MB RAM, region `yyz`,
  `min_machines_running = 1` so the alert evaluator's `setInterval` keeps firing.
- [`Dockerfile`](Dockerfile) — single-stage Node 20 Alpine image. `tsx` runs
  TypeScript directly at runtime (no build step), and `NODE_OPTIONS=--max-old-space-size=384`
  caps V8 below the 512 MB machine limit.
- [`.dockerignore`](.dockerignore) — excludes web source, openbb sidecar, and
  Drizzle SQL migrations from the image.

### 3. Frontend on Vercel

Import the repo at <https://vercel.com/new>. **Leave the project's Root Directory
empty** (repo root) — the [`vercel.json`](vercel.json) at the root drives the build:

```json
{
  "installCommand": "pnpm install --frozen-lockfile --prod=false",
  "buildCommand": "pnpm --filter @finatalk/web build",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://finatalk-server.fly.dev/api/:path*" }
  ]
}
```

Notes:

- `--prod=false` is required because `tsc`/`vite` live in `devDependencies`.
- The rewrite proxies all `/api/*` calls from the Vercel domain to the Fly
  backend, so the browser never sees a cross-origin request.
- If you change the Fly app name, update the rewrite destination accordingly.

No backend env vars are needed on Vercel — the frontend talks to the same origin
via the rewrite. After the first deploy, copy your Vercel domain (e.g.
`finatalk.vercel.app`) and add it to `APP_URL` on Fly. `APP_URL` accepts a
comma-separated list, so you can include both your Vercel domain and a custom
domain:

```bash
flyctl secrets set APP_URL="https://finatalk.vercel.app,https://api.sanotalk.com"
```

### Operational notes

- **Logs**: `flyctl logs` (backend), Vercel dashboard (frontend build/runtime).
- **Memory**: backend uses ~350–450 MB at steady state with all routes loaded.
  If you see OOMs in `flyctl logs`, bump memory: `flyctl scale memory 1024`.
- **Cost**: 512 MB shared-cpu-1x ≈ $4/mo, covered by Fly's $5/mo free credit.
  Vercel hobby tier is free. Neon free tier gives 0.5 GB storage.
