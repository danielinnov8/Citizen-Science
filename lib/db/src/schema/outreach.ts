import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const prospectTypeEnum = pgEnum("prospect_type", [
  "researcher",
  "scientist",
  "investor",
  "user",
]);

export const prospectStatusEnum = pgEnum("prospect_status", [
  "pending",
  "contacted",
  "replied",
  "unsubscribed",
]);

export const sendStatusEnum = pgEnum("send_status", [
  "pending",
  "delivered",
  "bounced",
  "complained",
]);

export const outreachProspectsTable = pgTable("outreach_prospects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  type: prospectTypeEnum("type").notNull().default("user"),
  notes: text("notes").notNull().default(""),
  status: prospectStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const outreachTemplatesTable = pgTable("outreach_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: prospectTypeEnum("type").notNull().unique(),
  subjectTemplate: text("subject_template").notNull(),
  bodyTemplate: text("body_template").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const outreachSendsTable = pgTable("outreach_sends", {
  id: uuid("id").primaryKey().defaultRandom(),
  prospectId: uuid("prospect_id")
    .notNull()
    .references(() => outreachProspectsTable.id, { onDelete: "cascade" }),
  templateId: uuid("template_id")
    .notNull()
    .references(() => outreachTemplatesTable.id, { onDelete: "restrict" }),
  resendMessageId: text("resend_message_id"),
  subject: text("subject").notNull(),
  status: sendStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Single-row settings table for the outreach scheduler.
export const outreachSettingsTable = pgTable("outreach_settings", {
  id: integer("id").primaryKey().default(1),
  sendHour: integer("send_hour").notNull().default(9),
  batchSize: integer("batch_size").notNull().default(20),
  fromEmail: text("from_email").notNull().default("outreach@citizenscience.app"),
  fromName: text("from_name").notNull().default("Citizen Science"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OutreachProspect = typeof outreachProspectsTable.$inferSelect;
export type InsertOutreachProspect =
  typeof outreachProspectsTable.$inferInsert;
export type OutreachTemplate = typeof outreachTemplatesTable.$inferSelect;
export type OutreachSend = typeof outreachSendsTable.$inferSelect;
export type OutreachSettings = typeof outreachSettingsTable.$inferSelect;
