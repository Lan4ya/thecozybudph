ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "select_policy" ON "addresses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "update_policy" ON "addresses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "delete_policy" ON "addresses" AS PERMISSIVE FOR DELETE TO "authenticated" USING (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "insert_policy" ON "addresses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = profile_id);