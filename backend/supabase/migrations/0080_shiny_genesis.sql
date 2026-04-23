CREATE POLICY "authenticated can update own payments" ON "payments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
