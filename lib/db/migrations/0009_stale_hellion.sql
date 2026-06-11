CREATE TABLE IF NOT EXISTS "mentee_waitlist" (
"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
"figure_slug" text NOT NULL,
"user_id" uuid NOT NULL,
"created_at" timestamp with time zone DEFAULT now() NOT NULL,
CONSTRAINT "mentee_waitlist_figure_slug_user_id_unique" UNIQUE("figure_slug","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mentee_waitlist" ADD CONSTRAINT "mentee_waitlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
