import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Per-subject, per-day counter for science-copilot questions. One row per
// (subjectKey, usageDate); each new UTC day starts fresh, so the daily quota
// resets automatically. `subjectKey` is "user:<id>" for authenticated free
// accounts and "guest:<anonId>" for anonymous visitors.
export const copilotUsageTable = pgTable(
  "copilot_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectKey: text("subject_key").notNull(),
    usageDate: date("usage_date").notNull(),
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("copilot_usage_subject_day_unique").on(t.subjectKey, t.usageDate)],
);

export type CopilotUsage = typeof copilotUsageTable.$inferSelect;
export type InsertCopilotUsage = typeof copilotUsageTable.$inferInsert;
