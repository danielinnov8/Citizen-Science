--> clear ephemeral handshake rows so the NOT NULL add always succeeds on a non-empty table
DELETE FROM "oauth_states";
--> statement-breakpoint
ALTER TABLE "oauth_states" ADD COLUMN IF NOT EXISTS "nonce_hash" text NOT NULL;
