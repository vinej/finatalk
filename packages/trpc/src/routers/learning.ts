import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { learningNote } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { IdInput } from "../schemas/common";

const TitleSchema = z.string().trim().min(1).max(120);
const DescriptionSchema = z.string().max(500);
const ContentSchema = z.string().max(100_000);

async function findOwned(
  ctx: { db: typeof import("@finatalk/db").db; user: { id: string } },
  id: string,
) {
  const row = await ctx.db.query.learningNote.findFirst({
    where: and(eq(learningNote.id, id), eq(learningNote.userId, ctx.user.id)),
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND" });
  return row;
}

export const learningRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: learningNote.id,
        title: learningNote.title,
        description: learningNote.description,
        createdAt: learningNote.createdAt,
        updatedAt: learningNote.updatedAt,
      })
      .from(learningNote)
      .where(eq(learningNote.userId, ctx.user.id))
      .orderBy(desc(learningNote.updatedAt));
    return rows;
  }),

  get: protectedProcedure
    .input(IdInput)
    .query(async ({ ctx, input }) => {
      const row = await findOwned(ctx, input.id);
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: TitleSchema,
        description: DescriptionSchema.default(""),
        content: ContentSchema.default(""),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      await ctx.db.insert(learningNote).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        content: input.content,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: TitleSchema.optional(),
        description: DescriptionSchema.optional(),
        content: ContentSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await findOwned(ctx, input.id);
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) values.title = input.title;
      if (input.description !== undefined) values.description = input.description;
      if (input.content !== undefined) values.content = input.content;
      await ctx.db
        .update(learningNote)
        .set(values)
        .where(and(eq(learningNote.id, input.id), eq(learningNote.userId, ctx.user.id)));
      return { id: input.id };
    }),

  delete: protectedProcedure
    .input(IdInput)
    .mutation(async ({ ctx, input }) => {
      await findOwned(ctx, input.id);
      await ctx.db
        .delete(learningNote)
        .where(and(eq(learningNote.id, input.id), eq(learningNote.userId, ctx.user.id)));
      return { id: input.id };
    }),
});
