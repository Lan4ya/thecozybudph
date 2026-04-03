CREATE POLICY "authenticated can select own payments" ON "payments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        EXISTS (
          SELECT 1 FROM orders  
          WHERE orders.id = order_id
          AND orders.profile_id = auth.uid()
        )
      );