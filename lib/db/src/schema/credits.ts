import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// Per-subject credit ledger backing the usage-based billing model. One row per
// subject. `subjectKey` is "user:<id>" for authenticated accounts and
// "guest:<anonId>" for anonymous visitors (mirrors the copilot usage counter),
// so signing out can't bypass the cap.
//
// Two pools are tracked:
//   - The monthly plan grant, consumed via `periodUsed` within `periodKey`
//     (a UTC "YYYY-MM" bucket). When a new month rolls over the stored
//     `periodKey` no longer matches, so `periodUsed` is treated as 0 — the
//     grant resets automatically with no scheduled job.
//   - `topupBalance`: non-expiring credits bought via top-up packs. Only drawn
//     down once the monthly grant is exhausted, and never reset.
export const creditAccountsTable = pgTable("credit_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectKey: text("subject_key").notNull().unique(),
  periodKey: text("period_key").notNull(),
  periodUsed: integer("period_used").notNull().default(0),
  topupBalance: integer("topup_balance").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type CreditAccount = typeof creditAccountsTable.$inferSelect;
export type InsertCreditAccount = typeof creditAccountsTable.$inferInsert;
