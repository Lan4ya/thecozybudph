CREATE TABLE "event_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" timestamp with time zone NOT NULL,
	"guest_count" integer,
	"venue" text,
	"budget" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "event_inquiries_status_check" CHECK ("event_inquiries"."status" IN ('new', 'contacted', 'quoted', 'closed'))
);
--> statement-breakpoint
ALTER TABLE "event_inquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_inquiries" ADD CONSTRAINT "event_inquiries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "authenticated can select own inquiry" ON "event_inquiries" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "authenticated can insert own inquiry" ON "event_inquiries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "anon can insert inquiry" ON "event_inquiries" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (profile_id IS NULL);