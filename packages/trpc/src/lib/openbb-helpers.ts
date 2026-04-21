import { TRPCError } from "@trpc/server";
import { getOpenBBClient, isOpenBBEnabled } from "@finatalk/openbb";

export function requireOpenBBClient() {
  if (!isOpenBBEnabled()) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenBB is not enabled." });
  }
  return getOpenBBClient();
}

export async function tryProviders<T>(
  providers: readonly string[],
  fn: (provider: string) => Promise<T | null>,
  isValid: (result: T) => boolean = () => true,
): Promise<T | null> {
  for (const provider of providers) {
    try {
      const result = await fn(provider);
      if (result != null && isValid(result)) return result;
    } catch {
      // try next provider
    }
  }
  return null;
}

export async function tryOrNull<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}
