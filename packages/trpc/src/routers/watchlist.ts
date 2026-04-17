import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { alert, watchlist, watchlistItem } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { SymbolSchema } from "../schemas/indicator";
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
          eq(watchlistItem.symbol, input.symbol.toUpperCase()),
        ),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Symbol already in watchlist." });
      const id = randomUUID();
      await ctx.db.insert(watchlistItem).values({
        id,
        watchlistId: wl.id,
        symbol: input.symbol.toUpperCase(),
        note: input.note ?? null,
      });
      return { id };
    }),

  removeItem: protectedProcedure
    .input(z.object({ id: z.string() }))
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
              symbol.toUpperCase(), "1mo", "1d", null,
            );
            if (candles.length === 0) {
              return { symbol: symbol.toUpperCase(), lastClose: null, prevClose: null, nativeCurrency, error: "no data" as string | null };
            }
            const last = candles[candles.length - 1]!;
            const prev = candles.length > 1 ? candles[candles.length - 2]! : null;
            return {
              symbol: symbol.toUpperCase(),
              lastClose: last.close,
              prevClose: prev?.close ?? null,
              nativeCurrency,
              error: null as string | null,
            };
          } catch {
            return { symbol: symbol.toUpperCase(), lastClose: null, prevClose: null, nativeCurrency: null, error: "fetch failed" as string | null };
          }
        }),
      );
      return results;
    }),

  listAlerts: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(alert)
      .where(eq(alert.userId, ctx.user.id))
      .orderBy(desc(alert.createdAt));
    return rows.map((r) => ({
      id: r.id,
      symbol: r.symbol,
      conditionType: r.conditionType,
      threshold: Number(r.threshold),
      enabled: r.enabled,
      triggeredAt: r.triggeredAt,
      createdAt: r.createdAt,
    }));
  }),

  createAlert: protectedProcedure
    .input(z.object({
      symbol: SymbolSchema,
      conditionType: z.enum(["price_above", "price_below"]),
      threshold: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      await ctx.db.insert(alert).values({
        id,
        userId: ctx.user.id,
        symbol: input.symbol.toUpperCase(),
        conditionType: input.conditionType,
        threshold: String(input.threshold),
      });
      return { id };
    }),

  deleteAlert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(alert)
        .where(and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)));
      return { id: input.id };
    }),

  toggleAlert: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(alert)
        .set({ enabled: input.enabled })
        .where(and(eq(alert.id, input.id), eq(alert.userId, ctx.user.id)));
      return { id: input.id };
    }),
});
