ALTER POLICY "authenticated can insert own payment" ON "payments" RENAME TO "authenticated can initiate payments for active orders";--> statement-breakpoint
CREATE POLICY "authenticated can update before expiry" ON "orders" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (expires_at > now());
