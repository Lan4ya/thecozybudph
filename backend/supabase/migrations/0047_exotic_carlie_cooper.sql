ALTER TABLE "order_address_snapshot" RENAME TO "order_address_snapshots";--> statement-breakpoint
ALTER TABLE "order_address_snapshots" DROP CONSTRAINT "order_address_snapshot_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_address_snapshots" ADD CONSTRAINT "order_address_snapshots_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;