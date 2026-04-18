import { boolean, date, index, jsonb, numeric, text, timestamp } from "drizzle-orm/pg-core";
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
    confidence: text("confidence"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    portfolioIdx: index("finatalk_holding_portfolio_idx").on(t.portfolioId),
    analysisIdx: index("finatalk_holding_analysis_idx").on(t.analysisId),
  }),
);

export const transaction = createTable(
  "transaction",
  {
    id: text("id").primaryKey(),
    holdingId: text("holding_id")
      .notNull()
      .references(() => holding.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    quantity: numeric("quantity", { precision: 24, scale: 8 }).notNull(),
    price: numeric("price", { precision: 24, scale: 8 }).notNull(),
    fee: numeric("fee", { precision: 24, scale: 8 }).notNull().default("0"),
    date: date("date").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    holdingIdx: index("finatalk_transaction_holding_idx").on(t.holdingId),
    dateIdx: index("finatalk_transaction_date_idx").on(t.date),
  }),
);

export const eventCache = createTable(
  "event_cache",
  {
    id: text("id").primaryKey(),
    symbol: text("symbol").notNull(),
    eventType: text("event_type").notNull(),
    eventDate: date("event_date").notNull(),
    title: text("title"),
    details: jsonb("details"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    symbolIdx: index("finatalk_event_cache_symbol_idx").on(t.symbol),
    dateIdx: index("finatalk_event_cache_date_idx").on(t.eventDate),
    fetchedIdx: index("finatalk_event_cache_fetched_idx").on(t.fetchedAt),
  }),
);

export type Portfolio = typeof portfolio.$inferSelect;
export type NewPortfolio = typeof portfolio.$inferInsert;
export type Holding = typeof holding.$inferSelect;
export type NewHolding = typeof holding.$inferInsert;
export type Transaction = typeof transaction.$inferSelect;
export type NewTransaction = typeof transaction.$inferInsert;
export type EventCache = typeof eventCache.$inferSelect;
export type NewEventCache = typeof eventCache.$inferInsert;
