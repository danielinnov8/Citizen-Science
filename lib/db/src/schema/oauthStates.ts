import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Server-side store for an in-flight Google OAuth handshake. Storing the state,
// PKCE verifier, and the exact redirect_uri in the shared database (instead of
// in signed browser cookies) makes the flow robust on multi-instance autoscale
// deployments and across the cross-domain Google -> callback redirect: the
// callback can always find the handshake by the random `state` Google echoes
// back, regardless of which instance handles it or which domain started it.
export const oauthStatesTable = pgTable("oauth_states", {
  // The random, unguessable state value also returned by Google as the lookup
  // key. Single-use: deleted the moment it is consumed at the callback.
  state: text("state").primaryKey(),
  verifier: text("verifier").notNull(),
  // sha256 hash of a random nonce that is also placed in a signed, SameSite=Lax
  // browser cookie at /authorize. The callback must present a cookie whose hash
  // matches this — proof that the same browser that started the flow is the one
  // completing it (login-CSRF protection). Storing only the hash means a DB read
  // never reveals the cookie value.
  nonceHash: text("nonce_hash").notNull(),
  // The exact redirect_uri sent to Google at /authorize. Reused verbatim at
  // token exchange, which Google requires to match byte-for-byte.
  redirectUri: text("redirect_uri").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OauthState = typeof oauthStatesTable.$inferSelect;
export type InsertOauthState = typeof oauthStatesTable.$inferInsert;
