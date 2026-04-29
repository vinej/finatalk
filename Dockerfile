# syntax=docker/dockerfile:1
# Single-stage image — small enough not to need multi-stage. tsx runs the TS
# source directly, so there's no build step inside the container.
# yahoo-finance2 v3 requires Node >= 22.
FROM node:22-alpine

# pnpm via Corepack (bundled with Node 22)
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
# Cap V8 old-space at 384 MB to leave headroom for tsx + native deps
# inside the 512 MB Fly machine. Prevents Linux OOM-killing the process.
ENV NODE_OPTIONS="--max-old-space-size=384"
EXPOSE 8080

# tsx watches no files in production — it just transpiles on import.
CMD ["pnpm", "--filter", "@finatalk/server", "exec", "tsx", "src/index.ts"]
