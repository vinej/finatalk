import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getOpenBBClient, isOpenBBEnabled } from "@finatalk/openbb";
import { createTRPCRouter, protectedProcedure } from "../trcp";

const RateKey = z.enum(["effr", "sofr", "ecb", "sonia", "estr", "iorb"]);
const Country = z.enum(["us", "ca"]);

function requireEnabled() {
  if (!isOpenBBEnabled()) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenBB is not enabled." });
  }
}

export const ratesRouter = createTRPCRouter({
  getYieldCurve: protectedProcedure
    .input(
      z
        .object({
          country: Country.optional(),
          date: z.string().optional(),
          provider: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      requireEnabled();
      const country = input?.country ?? "us";

      const attempts: Array<{ provider: string; country?: string }> = input?.provider
        ? [{ provider: input.provider }]
        : country === "ca"
          ? [{ provider: "econdb", country: "canada" }]
          : [{ provider: "fred" }, { provider: "federal_reserve" }];

      let lastError: unknown = null;
      for (const attempt of attempts) {
        try {
          const result = await getOpenBBClient().getYieldCurve({
            provider: attempt.provider,
            ...(attempt.country ? { country: attempt.country } : {}),
            ...(input?.date ? { date: input.date } : {}),
          });
          if (result.length > 0) return result;
        } catch (err) {
          lastError = err;
          console.error(
            `[rates.getYieldCurve] provider=${attempt.provider} country=${attempt.country ?? "-"} failed:`,
            err,
          );
        }
      }
      if (lastError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Yield curve unavailable",
        });
      }
      return [];
    }),

  getCentralBankRate: protectedProcedure
    .input(
      z.object({
        rate: RateKey,
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        provider: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      requireEnabled();
      try {
        return await getOpenBBClient().getCentralBankRate(input.rate, {
          ...(input.startDate ? { startDate: input.startDate } : {}),
          ...(input.endDate ? { endDate: input.endDate } : {}),
          ...(input.provider ? { provider: input.provider } : {}),
        });
      } catch (err) {
        console.error(`[rates.getCentralBankRate] rate=${input.rate} failed:`, err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Rate ${input.rate} unavailable`,
        });
      }
    }),

  getTreasurySpread: protectedProcedure
    .input(
      z.object({
        maturity: z.enum(["3m", "2y"]).default("3m"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        provider: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      requireEnabled();
      try {
        return await getOpenBBClient().getTreasurySpread({
          maturity: input.maturity,
          ...(input.startDate ? { startDate: input.startDate } : {}),
          ...(input.endDate ? { endDate: input.endDate } : {}),
          ...(input.provider ? { provider: input.provider } : {}),
        });
      } catch (err) {
        console.error(`[rates.getTreasurySpread] maturity=${input.maturity} failed:`, err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Treasury spread unavailable",
        });
      }
    }),

  getOecdPolicyRate: protectedProcedure
    .input(
      z.object({
        country: Country.default("ca"),
        duration: z.enum(["immediate", "short", "long"]).default("immediate"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      requireEnabled();
      const oecdCountry = input.country === "ca" ? "canada" : "united_states";
      try {
        return await getOpenBBClient().getOecdInterestRate({
          country: oecdCountry,
          duration: input.duration,
          frequency: "monthly",
          ...(input.startDate ? { startDate: input.startDate } : {}),
          ...(input.endDate ? { endDate: input.endDate } : {}),
        });
      } catch (err) {
        console.error(
          `[rates.getOecdPolicyRate] country=${input.country} duration=${input.duration} failed:`,
          err,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OECD rate unavailable",
        });
      }
    }),
});
