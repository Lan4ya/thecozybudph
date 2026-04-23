ALTER POLICY "authenticated can select own address" ON "orders" RENAME TO "authenticated can select own order";--> statement-breakpoint
ALTER POLICY "authenticated can select own payments" ON "payments" RENAME TO "authenticated can select own payment";--> statement-breakpoint
ALTER POLICY "authenticated can update own payments" ON "payments" RENAME TO "authenticated can update own payment";--> statement-breakpoint
ALTER POLICY "authenticated can insert own payments" ON "payments" RENAME TO "authenticated can insert own payment";--> statement-breakpoint
CREATE POLICY "authenticated can update own order" ON "orders" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);