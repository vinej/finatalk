/**
 * @fileoverview Web app entry point.
 *
 * Composes the React tree:
 *   I18nextProvider → trpc.Provider → QueryClientProvider → RouterProvider
 *
 * Cross-cutting behaviour wired here:
 *   - Session-expiry handling: the QueryClient's queryCache/mutationCache
 *     watch every error; on the first UNAUTHORIZED tRPC error the user is
 *     signed out and redirected to /login. The `redirectingToLogin` flag
 *     prevents re-entry / loops if multiple queries fail at once.
 *   - QueryClient defaults: 30 s staleTime, single retry per query/mutation,
 *     but never retry on UNAUTHORIZED (would just trigger the redirect again).
 *   - Router preload: "intent" — start fetching when the user hovers a link.
 *
 * The `Register` interface augmentation gives TanStack Router type-safety on
 * `<Link to="...">` paths across the app.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { trpc, trpcClient } from "./lib/trpc";
import { routeTree } from "./routeTree.gen";
import { Toaster } from "sonner";
import "./styles/globals.css";
import "./lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { authClient } from "./lib/auth-client";

function isUnauthorized(err: unknown): boolean {
  return (
    err instanceof TRPCClientError &&
    (err.data as { code?: string } | null)?.code === "UNAUTHORIZED"
  );
}

let redirectingToLogin = false;
function handleSessionExpired() {
  if (redirectingToLogin) return;
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  redirectingToLogin = true;
  void authClient.signOut().catch(() => {});
  window.location.href = "/login";
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => (isUnauthorized(err) ? false : count < 1),
    },
    mutations: {
      retry: (count, err) => (isUnauthorized(err) ? false : count < 1),
    },
  },
  queryCache: new QueryCache({
    onError: (err) => {
      if (isUnauthorized(err)) handleSessionExpired();
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      if (isUnauthorized(err)) handleSessionExpired();
    },
  }),
});

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </trpc.Provider>
    </I18nextProvider>
  </React.StrictMode>,
);
