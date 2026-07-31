-- Founding-member guest purchases + founding badge flag on users.
-- Idempotent: every statement is safe to run twice (prod boot replays files).
CREATE TABLE IF NOT EXISTS "founding_claims" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"email" text NOT NULL,
"plan_id" text NOT NULL,
"stripe_customer_id" text,
"stripe_session_id" text NOT NULL,
"claimed_by_user_id" uuid,
"claimed_at" timestamp with time zone,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
CONSTRAINT "founding_claims_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "founding_claims_email_idx" ON "founding_claims" ("email");
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "founding_member" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "founding_claims" ADD CONSTRAINT "founding_claims_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
