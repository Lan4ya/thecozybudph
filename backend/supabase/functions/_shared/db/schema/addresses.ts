import {
  pgTable,
  uuid,
  varchar,
  text,
  pgPolicy,
  index,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles.ts";
import { sql } from "drizzle-orm";
import { authenticatedRole } from "drizzle-orm/supabase";

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    postalCode: varchar("postal_code", { length: 4 }).notNull(),
    region: text("region").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    barangay: text("barangay").notNull(),
    addressLine: text("address_line").notNull(),
    phoneNumber: varchar("phone_number", { length: 13 }).notNull(),
  },
  (t) => [
    index("idx_addresses_profile_id_fk").on(t.profileId),

    pgPolicy("users can select own address", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("users can update own address", {
      as: "permissive",
      to: authenticatedRole,
      for: "update",
      using: sql`auth.uid() = profile_id`,
      withCheck: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("users can delete own address", {
      as: "permissive",
      to: authenticatedRole,
      for: "delete",
      using: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("users can insert own address", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`auth.uid() = profile_id`,
    }),
  ],
);
