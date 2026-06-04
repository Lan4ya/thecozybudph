import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgPolicy,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { profiles } from "./profiles.ts";

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
    province: text("province"),
    barangay: text("barangay").notNull(),
    addressLine: text("address_line").notNull(),
    phoneNumber: varchar("phone_number", { length: 13 }).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isCompanyAddress: boolean("is_company_address").default(false).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  },
  (t) => [
    index("idx_addresses_profile_id_fk").on(t.profileId),

    uniqueIndex("exactly_one_global_company_address")
      .on(sql`(true)`)
      .where(sql`${t.isCompanyAddress} = true`),

    uniqueIndex("unique_default_address_per_profile")
      .on(t.profileId)
      .where(sql`${t.isDefault} = true`),

    pgPolicy("users can select own or company address", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`auth.uid() = profile_id OR is_company_address = true`,
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
