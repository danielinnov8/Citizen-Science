CREATE TABLE IF NOT EXISTS "oauth_states" (
	"state" text PRIMARY KEY NOT NULL,
	"verifier" text NOT NULL,
	"redirect_uri" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
