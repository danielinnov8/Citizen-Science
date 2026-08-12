import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { featuredProfilesTable } from "./featuredProfiles";

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

// Where a prospect came from: a hand-entered/CSV-imported contact ("manual") or
// one auto-queued from a living directory figure ("directory").
export const prospectSourceEnum = pgEnum("prospect_source", [
  "manual",
  "directory",
]);

// Whether a prospect may enter the auto-send queue. Directory-sourced and
// AI-researched prospects start as "needs_review" and are held back until an
// admin explicitly approves them; manual prospects default to "approved" so the
// existing flow is unchanged.
export const prospectReviewStateEnum = pgEnum("prospect_review_state", [
  "needs_review",
  "approved",
]);

export const sendStatusEnum = pgEnum("send_status", [
  "pending",
  "delivered",
  "bounced",
  "complained",
]);

// Best-effort public contact channels gathered by the Gemini web research pass.
// All fields are optional — nothing is fabricated, so a sparsely-populated
// object is normal. `email` here is an AI-suggested candidate that must be
// confirmed by an admin before it is promoted to the sendable `email` column.
export interface ProspectContactInfo {
  email?: string | null;
  website?: string | null;
  contactPage?: string | null;
  socials?: string[];
  notes?: string | null;
  // Set when the second, deeper email-hunting pass has run for this prospect
  // (idempotency marker for the deep-research script; not exposed on the wire).
  deepSearched?: boolean;
}

export const outreachProspectsTable = pgTable(
  "outreach_prospects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    // Nullable: a directory figure can be queued before any sendable email is
    // confirmed. The unique constraint still holds (Postgres treats NULLs as
    // distinct), so multiple email-less prospects can coexist.
    email: text("email").unique(),
    type: prospectTypeEnum("type").notNull().default("user"),
    notes: text("notes").notNull().default(""),
    status: prospectStatusEnum("status").notNull().default("pending"),
    // Link back to the source directory profile (set for directory-sourced
    // prospects; null for manual ones). Unique so re-queuing is idempotent.
    profileId: uuid("profile_id").references(() => featuredProfilesTable.id, {
      onDelete: "set null",
    }),
    source: prospectSourceEnum("source").notNull().default("manual"),
    reviewState: prospectReviewStateEnum("review_state")
      .notNull()
      .default("approved"),
    contactInfo: jsonb("contact_info")
      .$type<ProspectContactInfo>()
      .notNull()
      .default({}),
    // When the Gemini contact research last ran for this prospect. Null = not
    // yet researched; the resumable batch skips already-researched rows.
    researchedAt: timestamp("researched_at", { withTimezone: true }),
    // Admin-edited final copy. When BOTH are set, sends use them verbatim
    // instead of regenerating from the template + AI personalisation. Either
    // alone is ignored (defensive: never send a half-drafted email).
    draftSubject: text("draft_subject"),
    draftBody: text("draft_body"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("outreach_prospects_profile_id_unique").on(t.profileId),
  ],
);

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
  // Must live on the verified Resend domain (citizen-science.org) or sends are
  // rejected. Defaults to the founder's real mailbox so replies reach a human.
  fromEmail: text("from_email")
    .notNull()
    .default("daniel@citizen-science.org"),
  fromName: text("from_name").notNull().default("Daniel (Citizen Science)"),
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
