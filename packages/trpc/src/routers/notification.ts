import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { notification } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({ limit: z.number().int().min(1).max(50).default(20) }).default({}),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(notification)
        .where(eq(notification.userId, ctx.user.id))
        .orderBy(desc(notification.createdAt))
        .limit(input.limit);
      return rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        link: r.link,
        read: r.readAt != null,
        createdAt: r.createdAt,
      }));
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ id: notification.id })
      .from(notification)
      .where(and(eq(notification.userId, ctx.user.id), isNull(notification.readAt)));
    return { count: rows.length };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notification)
        .set({ readAt: new Date() })
        .where(and(eq(notification.id, input.id), eq(notification.userId, ctx.user.id)));
      return { id: input.id };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.userId, ctx.user.id), isNull(notification.readAt)));
    return { ok: true };
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(notification)
        .where(and(eq(notification.id, input.id), eq(notification.userId, ctx.user.id)));
      return { id: input.id };
    }),
});
