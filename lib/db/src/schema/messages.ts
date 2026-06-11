import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Direct person-to-person messages between member accounts. A message can be
// sent directly to a member or routed to a featured directory profile. When the
// target profile already has a verified owner the route resolves the owner to a
// userId immediately (`recipientId` set). When the target is a living member who
// has NOT claimed their profile yet, the message is HELD: `recipientId` is null
// and `profileSlug` records the target so it can be delivered (recipientId set)
// the moment that profile is claimed/approved. `readAt` is null until the
// recipient opens it, which drives the inbox unread count/badge.
export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // Null while a message is held for an unclaimed profile; set to the owner's
  // user id once delivered.
  recipientId: uuid("recipient_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  // The featured profile this message targets (for held + profile-routed
  // messages). Null for direct member-to-member messages.
  profileSlug: text("profile_slug"),
  subject: text("subject"),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
