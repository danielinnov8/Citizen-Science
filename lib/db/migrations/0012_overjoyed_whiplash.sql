CREATE TYPE "public"."prospect_status" AS ENUM('pending', 'contacted', 'replied', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."prospect_type" AS ENUM('researcher', 'scientist', 'investor', 'user');--> statement-breakpoint
CREATE TYPE "public"."send_status" AS ENUM('pending', 'delivered', 'bounced', 'complained');--> statement-breakpoint
CREATE TABLE "outreach_prospects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"type" "prospect_type" DEFAULT 'user' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" "prospect_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_contacted_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outreach_prospects_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "outreach_sends" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prospect_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"resend_message_id" text,
	"subject" text NOT NULL,
	"status" "send_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"send_hour" integer DEFAULT 9 NOT NULL,
	"batch_size" integer DEFAULT 20 NOT NULL,
	"from_email" text DEFAULT 'outreach@citizenscience.app' NOT NULL,
	"from_name" text DEFAULT 'Citizen Science' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "prospect_type" NOT NULL,
	"subject_template" text NOT NULL,
	"body_template" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outreach_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "outreach_sends" ADD CONSTRAINT "outreach_sends_prospect_id_outreach_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."outreach_prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach_sends" ADD CONSTRAINT "outreach_sends_template_id_outreach_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."outreach_templates"("id") ON DELETE restrict ON UPDATE no action;