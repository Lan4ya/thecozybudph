ALTER POLICY "authenticated can select own order address snapshot" ON "order_address_snapshots" TO authenticated USING (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = (select auth.uid())
        )
      );--> statement-breakpoint
ALTER POLICY "authenticated can insert own order addres snapshot" ON "order_address_snapshots" TO authenticated WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND (orders.profile_id = auth.uid())
        )
      );--> statement-breakpoint
ALTER POLICY "authenticated can select own order items snapshot" ON "order_items_snapshots" TO authenticated USING (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND (orders.profile_id = auth.uid())
        )
      );--> statement-breakpoint
ALTER POLICY "authenticated can insert own order items snapshot" ON "order_items_snapshots" TO authenticated WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND (orders.profile_id = auth.uid())
        )
      );--> statement-breakpoint
ALTER POLICY "authenticated can select own order" ON "orders" TO authenticated USING ((select auth.uid()) = profile_id);--> statement-breakpoint
ALTER POLICY "authenticated can insert own order" ON "orders" TO authenticated WITH CHECK ((select auth.uid()) = profile_id);--> statement-breakpoint
CREATE POLICY "postgres can update active order" ON "orders" AS PERMISSIVE FOR UPDATE TO postgres USING ((select auth.uid()) = profile_id AND expires_at > now()) WITH CHECK ((select auth.uid()) = profile_id);
ALTER POLICY "authenticated can select own payment" ON "payments" TO authenticated USING ((select auth.uid()) = profile_id);--> statement-breakpoint
ALTER POLICY "authenticated can update own payment" ON "payments" TO authenticated USING ((select auth.uid()) = profile_id) WITH CHECK ((select auth.uid()) = profile_id);--> statement-breakpoint
ALTER POLICY "authenticated can initiate payments for active orders" ON "payments" TO authenticated WITH CHECK (
    (select auth.uid()) = profile_id AND 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.expires_at > now()
    ));
