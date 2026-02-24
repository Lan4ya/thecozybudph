CREATE INDEX "idx_addresses_profile_id" ON "addresses" USING btree ("product_collection_id");--> statement-breakpoint
CREATE INDEX "idx_carts_profile_id" ON "carts" USING btree ("profile_id");--> statement-breakpoint
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_provider_event_id_unique" UNIQUE("provider_event_id");