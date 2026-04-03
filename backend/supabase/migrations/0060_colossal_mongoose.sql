ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "authenticated can insert own payments" ON "payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders  
          WHERE orders.id = order_id
          AND orders.profile_id = auth.uid()
        )
      );