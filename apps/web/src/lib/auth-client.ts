/**
 * @fileoverview better-auth React client.
 *
 * Mirror of the server-side `auth` instance, talking to /api/auth/* on the
 * same origin (rewritten to Fly in production). The two-factor plugin is
 * enabled here so `authClient.twoFactor.*` is available in the UI.
 *
 * `useSession`, `signIn`, `signUp`, `signOut` are re-exported as named hooks
 * for convenience.
 *
 * `getCachedSession()` wraps the raw network call with a 30-second cache so
 * TanStack Router's hover-preload + navigate pattern doesn't fire two
 * round-trips for every link click. Call `clearSessionCache()` after sign-in
 * / sign-out so the next read sees fresh state.
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

const SESSION_CACHE_TTL_MS = 30_000;
type SessionResult = Awaited<ReturnType<typeof authClient.getSession>>;
let cached: { value: SessionResult; expiresAt: number } | null = null;
let inflight: Promise<SessionResult> | null = null;

export async function getCachedSession(): Promise<SessionResult> {
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (inflight) return inflight;
  inflight = authClient.getSession().then((value) => {
    cached = { value, expiresAt: Date.now() + SESSION_CACHE_TTL_MS };
    return value;
  });
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function clearSessionCache(): void {
  cached = null;
  inflight = null;
}
