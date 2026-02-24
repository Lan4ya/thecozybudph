import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { profiles } from "./profiles.ts";
import { index } from "drizzle-orm/pg-core";

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("product_collection_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    full_name: varchar("full_name", { length: 255 }).notNull(),
    postal_code: varchar("postal_code", { length: 4 }).notNull(),
    region: text("region").notNull(),
    city: text("region").notNull(),
    province: text("region").notNull(),
    barangay: text("region").notNull(),
    address_line: text("region").notNull(),
    phone_number: varchar("phone_number", { length: 11 }).notNull(),
  },
  (table) => [index("idx_addresses_profile_id").on(table.profileId)],
);
