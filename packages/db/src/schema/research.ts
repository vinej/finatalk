import { index, text, timestamp } from "drizzle-orm/pg-core";
import { createTable } from "./auth";

export const edgarCache = createTable(
  "edgar_cache",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    expiresIdx: index("finatalk_edgar_cache_expires_idx").on(t.expiresAt),
  }),
);
