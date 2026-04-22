import { index, jsonb, numeric, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createTable, user } from "./auth";
import { portfolio } from "./portfolio";

export const watchlist = createTable(
  "watchlist",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_watchlist_user_idx").on(t.userId),
    userUniq: uniqueIndex("finatalk_watchlist_user_uniq").on(t.userId),
  }),
);

export const watchlistItem = createTable(
  "watchlist_item",
  {
    id: text("id").primaryKey(),
    watchlistId: text("watchlist_id")
      .notNull()
      .references(() => watchlist.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    watchlistIdx: index("finatalk_watchlist_item_watchlist_idx").on(t.watchlistId),
    watchlistSymbolUniq: uniqueIndex("finatalk_watchlist_item_watchlist_symbol_uniq").on(t.watchlistId, t.symbol),
  }),
);

export const alert = createTable(
  "alert",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    conditionType: text("condition_type").notNull(),
    threshold: numeric("threshold", { precision: 24, scale: 8 }).notNull(),
    indicatorParams: jsonb("indicator_params"),
    source: text("source").notNull().default("manual"),
    assetType: text("asset_type"),
    strategyKind: text("strategy_kind"),
    portfolioId: text("portfolio_id").references(() => portfolio.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull().default(true),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_alert_user_idx").on(t.userId),
    symbolIdx: index("finatalk_alert_symbol_idx").on(t.symbol),
    portfolioIdx: index("finatalk_alert_portfolio_idx").on(t.portfolioId),
    sourceIdx: index("finatalk_alert_source_idx").on(t.source),
  }),
);

export type Watchlist = typeof watchlist.$inferSelect;
export type WatchlistItem = typeof watchlistItem.$inferSelect;
export type Alert = typeof alert.$inferSelect;
