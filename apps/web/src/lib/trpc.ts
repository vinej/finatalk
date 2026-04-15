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
