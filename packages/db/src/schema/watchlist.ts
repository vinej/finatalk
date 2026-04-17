import { index, numeric, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createTable, user } from "./auth";

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
    enabled: boolean("enabled").notNull().default(true),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_alert_user_idx").on(t.userId),
    symbolIdx: index("finatalk_alert_symbol_idx").on(t.symbol),
  }),
);

export type Watchlist = typeof watchlist.$inferSelect;
export type WatchlistItem = typeof watchlistItem.$inferSelect;
export type Alert = typeof alert.$inferSelect;
