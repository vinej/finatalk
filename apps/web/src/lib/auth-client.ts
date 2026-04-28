/**
 * @fileoverview better-auth React client.
 *
 * Mirror of the server-side `auth` instance, talking to /api/auth/* on the
 * same origin (rewritten to Fly in production). The two-factor plugin is
 * enabled here so `authClient.twoFactor.*` is available in the UI.
 *
 * `useSession`, `signIn`, `signUp`, `signOut` are re-exported as named hooks
 * for convenience.
 */
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.VITE_API_URL,
  plugins: [twoFactorClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
