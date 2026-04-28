# syntax=docker/dockerfile:1
# Single-stage image — small enough not to need multi-stage. tsx runs the TS
# source directly, so there's no build step inside the container.
FROM node:20-alpine

# pnpm via Corepack (bundled with Node 20)
RUN corepack enable
WORKDIR /app

# Copy workspace manifests first so dep installation is cached separately
# from source changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/trpc/package.json packages/trpc/
COPY packages/openbb/package.json packages/openbb/

# --prod=false because tsx + typescript live in devDependencies and we need
# them at runtime.
RUN pnpm install --frozen-lockfile --prod=false

# Now the source. Only what the server needs.
COPY tsconfig.base.json ./
COPY apps/server apps/server/
COPY packages packages/

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# tsx watches no files in production — it just transpiles on import.
CMD ["pnpm", "--filter", "@finatalk/server", "exec", "tsx", "src/index.ts"]
