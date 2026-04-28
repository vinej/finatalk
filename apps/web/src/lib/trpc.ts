/**
 * @fileoverview Frontend tRPC client.
 *
 * Exports:
 *   - `trpc`        — typed React-Query hooks (`trpc.market.analyze.useQuery(...)`).
 *   - `trpcClient`  — vanilla client for non-React call sites.
 *
 * The API origin is the current `window.origin` in the browser (so the Vercel
 * `/api/*` rewrite forwards to Fly without a CORS preflight) and falls back
 * to `VITE_API_URL` for SSR/tests.
 *
 * `x-trpc-source: myapp-web` is the CSRF token: the Express middleware
 * rejects any /api/trpc request without it. Cookies are included so the
 * better-auth session travels with each call.
 */
import { createTRPCReact, type CreateTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@finatalk/trpc";
import superjson from "superjson";

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) =>
        import.meta.env.DEV ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${typeof window !== "undefined" ? window.location.origin : import.meta.env.VITE_API_URL}/api/trpc`,
      transformer: superjson,
      headers() {
        return { "x-trpc-source": "myapp-web" };
      },
      fetch(url, options) {
        return fetch(url, { ...(options as RequestInit), credentials: "include" });
      },
    }),
  ],
});
