import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { user } from "@finatalk/db";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      image: z.string().url().max(500).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const values: Record<string, unknown> = {};
      if (input.name !== undefined) values.name = input.name;
      if (input.image !== undefined) values.image = input.image;
      if (Object.keys(values).length === 0) return { ok: true };
      values.updatedAt = new Date();
      const [updated] = await ctx.db
        .update(user)
        .set(values)
        .where(eq(user.id, ctx.user.id))
        .returning({ id: user.id, name: user.name, image: user.image });
      return updated;
    }),
});
