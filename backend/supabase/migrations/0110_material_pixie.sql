CREATE TYPE "public"."cooldown_type" AS ENUM('otp_sms', 'email_verification', 'password_reset');--> statement-breakpoint
CREATE TABLE "action_cooldowns" (
	"profile_id" uuid NOT NULL,
	"action_type" "cooldown_type" NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "action_cooldowns" ADD CONSTRAINT "action_cooldowns_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;