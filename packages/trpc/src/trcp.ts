/**
 * @fileoverview tRPC root setup.
 *
 * Creates the tRPC instance with superjson (so Date/BigInt/Map round-trip)
 * and exports the procedure builders used everywhere:
 *   - `publicProcedure` — no auth required (rare; most routes need a session).
 *   - `protectedProcedure` — enforces an authenticated session and, when
 *     EMAIL_VERIFICATION=on, also that the user's email is verified.
 *
 * The error formatter exposes Zod issues and stack traces only outside of
 * production so the browser console gets useful detail in dev without leaking
 * internals in prod.
 *
 * Filename note: kept as `trcp.ts` (typo) because changing it would break
 * a lot of imports across the workspace; not worth the churn.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { TRPCContext } from "./context";
import superjson from "superjson";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const isProd = process.env.NODE_ENV === "production";
    return {
      ...shape,
      data: {
        ...shape.data,
        stack: isProd ? undefined : shape.data.stack,
        zodError:
          !isProd && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Email verification gate is opt-in via EMAIL_VERIFICATION=on (default off for dev).
  if (process.env.EMAIL_VERIFICATION === "on" && !(ctx.user as { emailVerified?: boolean }).emailVerified) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Email not verified" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});
