import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { watchlist, watchlistItem } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";
import { IdInput } from "../schemas/common";
import { fetchCandlesWithCurrency } from "./market";

export const watchlistRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    let wl = await ctx.db.query.watchlist.findFirst({
      where: eq(watchlist.userId, ctx.user.id),
    });
    if (!wl) {
      const id = randomUUID();
      const rows = await ctx.db
        .insert(watchlist)
        .values({ id, userId: ctx.user.id, title: "Watchlist" })
        .returning();
      wl = rows[0]!;
    }
    const items = await ctx.db
      .select()
      .from(watchlistItem)
      .where(eq(watchlistItem.watchlistId, wl.id))
      .orderBy(asc(watchlistItem.createdAt));
    return {
      id: wl.id,
      title: wl.title,
      items: items.map((i) => ({
        id: i.id,
        symbol: i.symbol,
        note: i.note,
        createdAt: i.createdAt,
      })),
    };
  }),

  addItem: protectedProcedure
    .input(z.object({ symbol: SymbolSchema, note: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      const wl = await ctx.db.query.watchlist.findFirst({
        where: eq(watchlist.userId, ctx.user.id),
      });
      if (!wl) throw new TRPCError({ code: "NOT_FOUND" });
      const existing = await ctx.db.query.watchlistItem.findFirst({
        where: and(
          eq(watchlistItem.watchlistId, wl.id),
          eq(watchlistItem.symbol, input.symbol),
        ),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Symbol already in watchlist." });
      const id = randomUUID();
      await ctx.db.insert(watchlistItem).values({
        id,
        watchlistId: wl.id,
        symbol: input.symbol,
        note: input.note ?? null,
      });
      return { id };
    }),

  removeItem: protectedProcedure
    .input(IdInput)
    .mutation(async ({ ctx, input }) => {
      const wl = await ctx.db.query.watchlist.findFirst({
        where: eq(watchlist.userId, ctx.user.id),
      });
      if (!wl) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db
        .delete(watchlistItem)
        .where(and(eq(watchlistItem.id, input.id), eq(watchlistItem.watchlistId, wl.id)));
      return { id: input.id };
    }),

  getQuotes: protectedProcedure
    .input(z.object({ symbols: z.array(SymbolSchema).max(50) }))
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.symbols.map(async (symbol) => {
          try {
            const { candles, nativeCurrency } = await fetchCandlesWithCurrency(
              symbol, "1mo", "1d", null,
            );
            if (candles.length === 0) {
              return { symbol, lastClose: null, prevClose: null, nativeCurrency, error: "no data" as string | null };
            }
            const last = candles[candles.length - 1]!;
            const prev = candles.length > 1 ? candles[candles.length - 2]! : null;
            return {
              symbol,
              lastClose: last.close,
              prevClose: prev?.close ?? null,
              nativeCurrency,
              error: null as string | null,
            };
          } catch {
            return { symbol, lastClose: null, prevClose: null, nativeCurrency: null, error: "fetch failed" as string | null };
          }
        }),
      );
      return results;
    }),

});
