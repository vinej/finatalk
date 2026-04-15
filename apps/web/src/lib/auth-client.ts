import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.VITE_API_URL,
  plugins: [twoFactorClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
