# Finatalk

A full-stack TypeScript application with a 4-layer architecture:

```
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
pnpm db:migrate
pnpm dev
```

Open http://localhost:5173.

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
