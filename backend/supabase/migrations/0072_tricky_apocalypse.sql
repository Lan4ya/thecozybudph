ALTER TABLE "payments" ADD COLUMN "profile_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER POLICY "authenticated can select own payments" ON "payments" TO authenticated USING (auth.uid() = profile_id);--> statement-breakpoint
ALTER POLICY "authenticated can insert own payments" ON "payments" TO authenticated WITH CHECK (auth.uid() = profile_id);
