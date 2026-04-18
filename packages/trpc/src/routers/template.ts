import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { template, templateTag, portfolio, holding } from "@finatalk/db";
import { createTRPCRouter, protectedProcedure } from "../trcp";
import { CurrencySchema, PortfolioTitleSchema } from "../schemas/portfolio";
import { SymbolSchema } from "../schemas/indicator";

const TemplateHoldingSchema = z.object({
  symbol: SymbolSchema,
  weightPct: z.number().min(0).max(100),
});

export type TemplateHolding = z.infer<typeof TemplateHoldingSchema>;

export const templateRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      tag: z.string().min(1).max(50).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(template)
        .orderBy(desc(template.createdAt));

      const tagRows = await ctx.db.select().from(templateTag);
      const tagMap = new Map<string, string[]>();
      for (const r of tagRows) {
        const arr = tagMap.get(r.templateId) ?? [];
        arr.push(r.tag);
        tagMap.set(r.templateId, arr);
      }

      let result = rows.map((t) => ({
        ...t,
        holdings: t.holdings as TemplateHolding[],
        tags: tagMap.get(t.id) ?? [],
      }));

      if (input?.tag) {
        result = result.filter((t) => t.tags.includes(input.tag!));
      }

      return result;
    }),

  myTemplates: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(template)
      .where(eq(template.userId, ctx.user.id))
      .orderBy(desc(template.createdAt));

    const ids = rows.map((r) => r.id);
    const tagRows = ids.length > 0
      ? await ctx.db.select().from(templateTag)
      : [];
    const tagMap = new Map<string, string[]>();
    for (const r of tagRows) {
      if (ids.includes(r.templateId)) {
        const arr = tagMap.get(r.templateId) ?? [];
        arr.push(r.tag);
        tagMap.set(r.templateId, arr);
      }
    }

    return rows.map((t) => ({
      ...t,
      holdings: t.holdings as TemplateHolding[],
      tags: tagMap.get(t.id) ?? [],
    }));
  }),

  publish: protectedProcedure
    .input(z.object({
      portfolioId: z.string().uuid(),
      title: PortfolioTitleSchema,
      description: z.string().max(2000).optional(),
      tags: z.array(z.string().min(1).max(50)).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const p = await ctx.db.query.portfolio.findFirst({
        where: and(eq(portfolio.id, input.portfolioId), eq(portfolio.userId, ctx.user.id)),
      });
      if (!p) throw new TRPCError({ code: "NOT_FOUND", message: "Portfolio not found." });

      const holdings = await ctx.db
        .select()
        .from(holding)
        .where(eq(holding.portfolioId, p.id));

      if (holdings.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Portfolio has no holdings." });
      }

      const totalCost = holdings.reduce((s, h) => s + Number(h.quantity) * Number(h.costBasis), 0);
      const templateHoldings: TemplateHolding[] = holdings.map((h) => ({
        symbol: h.symbol,
        weightPct: totalCost > 0
          ? Math.round((Number(h.quantity) * Number(h.costBasis) / totalCost) * 10000) / 100
          : Math.round(10000 / holdings.length) / 100,
      }));

      const id = randomUUID();
      await ctx.db.insert(template).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? null,
        currency: p.currency,
        holdings: templateHoldings,
      });

      if (input.tags && input.tags.length > 0) {
        await ctx.db.insert(templateTag).values(
          input.tags.map((tag) => ({ id: randomUUID(), templateId: id, tag })),
        );
      }

      return { id };
    }),

  clone: protectedProcedure
    .input(z.object({
      templateId: z.string().uuid(),
      title: PortfolioTitleSchema,
      budget: z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tpl = await ctx.db.query.template.findFirst({
        where: eq(template.id, input.templateId),
      });
      if (!tpl) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });

      const tplHoldings = tpl.holdings as TemplateHolding[];

      const portfolioId = randomUUID();
      await ctx.db.insert(portfolio).values({
        id: portfolioId,
        userId: ctx.user.id,
        title: input.title,
        currency: tpl.currency,
      });

      for (const h of tplHoldings) {
        const allocation = (h.weightPct / 100) * input.budget;
        const costBasis = allocation > 0 ? allocation : 0;
        await ctx.db.insert(holding).values({
          id: randomUUID(),
          portfolioId,
          symbol: h.symbol,
          quantity: "1",
          costBasis: costBasis.toFixed(2),
          purchaseDate: new Date().toISOString().slice(0, 10),
        });
      }

      await ctx.db
        .update(template)
        .set({ cloneCount: sql`${template.cloneCount}::int + 1` })
        .where(eq(template.id, input.templateId));

      return { portfolioId };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const tpl = await ctx.db.query.template.findFirst({
        where: and(eq(template.id, input.id), eq(template.userId, ctx.user.id)),
      });
      if (!tpl) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found." });

      await ctx.db.delete(template).where(eq(template.id, input.id));
      return { success: true };
    }),
});
