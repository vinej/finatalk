import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { db } from "@finatalk/db";
import { auth } from "./auth";

export async function createTRPCContext(opts: CreateExpressContextOptions) {
  const session = await auth.api.getSession({
    headers: opts.req.headers as unknown as Headers,
  });

  return {
    db,
    session,
    user: session?.user ?? null,
    req: opts.req,
    res: opts.res,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
