import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const stripeProcessedEventsTable = pgTable(
  "stripe_processed_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeEventId: text("stripe_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);
