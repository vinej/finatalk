import { index, jsonb, text, timestamp } from "drizzle-orm/pg-core";
import { createTable, user } from "./auth";

export const analysis = createTable(
  "analysis",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull().default(""),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    range: text("range").notNull().default("1y"),
    interval: text("interval").notNull().default("1d"),
    convertTo: text("convert_to"),
    indicators: jsonb("indicators").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_analysis_user_idx").on(t.userId, t.createdAt),
    userSymbolIdx: index("finatalk_analysis_user_symbol_idx").on(t.userId, t.symbol),
  }),
);

export const savedChart = createTable(
  "saved_chart",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    symbol: text("symbol").notNull(),
    range: text("range").notNull(),
    interval: text("interval").notNull(),
    convertTo: text("convert_to"),
    indicators: jsonb("indicators").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_saved_chart_user_idx").on(t.userId, t.createdAt),
  }),
);

export type Analysis = typeof analysis.$inferSelect;
export type NewAnalysis = typeof analysis.$inferInsert;
export type SavedChart = typeof savedChart.$inferSelect;
export type NewSavedChart = typeof savedChart.$inferInsert;
