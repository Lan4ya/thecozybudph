DROP INDEX "idx_addresses_profile_id";--> statement-breakpoint
CREATE INDEX "idx_addresses_profile_id_fk" ON "addresses" USING btree ("profile_id");