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
    accountType: text("account_type"),
    manageTransactions: boolean("manage_transactions").notNull().default(false),
    strategyKind: text("strategy_kind"),
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
    assetType: text("asset_type"),
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

export const template = createTable(
  "template",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    currency: text("currency").notNull(),
    holdings: jsonb("holdings").notNull(),
    cloneCount: numeric("clone_count", { precision: 10, scale: 0 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_template_user_idx").on(t.userId),
    createdIdx: index("finatalk_template_created_idx").on(t.createdAt),
  }),
);

export const templateTag = createTable(
  "template_tag",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => template.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (t) => ({
    templateIdx: index("finatalk_template_tag_template_idx").on(t.templateId),
    tagIdx: index("finatalk_template_tag_tag_idx").on(t.tag),
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
export type Template = typeof template.$inferSelect;
export type NewTemplate = typeof template.$inferInsert;
export type TemplateTag = typeof templateTag.$inferSelect;
