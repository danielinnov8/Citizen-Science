CREATE TABLE IF NOT EXISTS "stripe_processed_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "stripe_event_id" text NOT NULL,
  "event_type" text NOT NULL,
  "processed_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "stripe_processed_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
