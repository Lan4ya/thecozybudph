ALTER TABLE "order_address_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "users can select own order address snapshot" ON "order_address_snapshots" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "users can insert own order addres snapshot" ON "order_address_snapshots" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "users can select own order items snapshot" ON "order_items_snapshots" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "users can insert own order items snapshot" ON "order_items_snapshots" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      );--> statement-breakpoint
CREATE POLICY "users can select own address" ON "orders" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "users can insert own order" ON "orders" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = profile_id);