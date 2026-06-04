ALTER TABLE "shipments" ADD COLUMN "shipment_status_updated_at" timestamp with time zone;--> statement-breakpoint
DROP POLICY "postgresRole can update active order" ON "orders" CASCADE;