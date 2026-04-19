import { index, text, timestamp } from "drizzle-orm/pg-core";
import { createTable, user } from "./auth";

export const learningNote = createTable(
  "learning_note",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("finatalk_learning_note_user_idx").on(t.userId, t.updatedAt),
  }),
);

export type LearningNote = typeof learningNote.$inferSelect;
export type NewLearningNote = typeof learningNote.$inferInsert;
