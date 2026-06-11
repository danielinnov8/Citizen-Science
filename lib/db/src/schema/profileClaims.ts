import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { featuredProfilesTable } from "./featuredProfiles";

// A request from a logged-in user to claim ownership of a living innovator's
// directory profile. Admins review each claim in the admin portal and approve
// or deny it. On approval the reviewed profile's `ownerUserId` is set, from
// which a "Verified" badge and edit rights are derived. The `email` column
// records the account email the claim was submitted with (claims are always
// submitted using the current user's own account email — never retyped).
export type ProfileClaimStatus = "pending" | "approved" | "denied";

export const profileClaimsTable = pgTable(
  "profile_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => featuredProfilesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // The account email the claim was applied with (snapshot at submit time).
    email: text("email").notNull(),
    status: text("status")
      .$type<ProfileClaimStatus>()
      .notNull()
      .default("pending"),
    // The superadmin who approved/denied the claim, and when.
    reviewedBy: uuid("reviewed_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // A user can only have one claim per profile. Re-submitting reuses the row.
    uniqueIndex("profile_claims_profile_user_unique").on(
      table.profileId,
      table.userId,
    ),
  ],
);

export type ProfileClaim = typeof profileClaimsTable.$inferSelect;
export type InsertProfileClaim = typeof profileClaimsTable.$inferInsert;
