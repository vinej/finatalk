import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { createTable } from "./auth";

export const loginAttempt = createTable("login_attempt", {
  email: text("email").primaryKey(),
  count: integer("count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoginAttempt = typeof loginAttempt.$inferSelect;
