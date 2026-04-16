import { date, index, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { analysis } from "./analysis";
import { createTable, user } from "./auth";

export const portfolio = createTable(
  "portfolio",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_portfolio_user_idx").on(t.userId, t.createdAt),
  }),
);

export const holding = createTable(
  "holding",
  {
    id: text("id").primaryKey(),
    portfolioId: text("portfolio_id")
      .notNull()
      .references(() => portfolio.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    quantity: numeric("quantity", { precision: 24, scale: 8 }).notNull(),
    costBasis: numeric("cost_basis", { precision: 24, scale: 8 }).notNull(),
    purchaseDate: date("purchase_date").notNull(),
    analysisId: text("analysis_id").references(() => analysis.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    portfolioIdx: index("finatalk_holding_portfolio_idx").on(t.portfolioId),
    analysisIdx: index("finatalk_holding_analysis_idx").on(t.analysisId),
  }),
);

export type Portfolio = typeof portfolio.$inferSelect;
export type NewPortfolio = typeof portfolio.$inferInsert;
export type Holding = typeof holding.$inferSelect;
export type NewHolding = typeof holding.$inferInsert;
