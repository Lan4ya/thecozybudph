import {
  pgTable,
  uuid,
  integer,
  jsonb,
  varchar,
  check,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.ts";
import { index } from "drizzle-orm/pg-core";

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    unique("carts_one_per_profile").on(table.profileId),
    index("idx_carts_profile_id").on(table.profileId),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    cartId: uuid("cart_id").references(() => carts.id, {
      onDelete: "cascade",
    }),
    productId: uuid("product_id").notNull(),
    quantity: integer("quantity").notNull(),
    productVariant: jsonb("product_variant").default({}).notNull(),
    cardMessages: varchar("card_messages", { length: 600 })
      .array()
      .notNull()
      .default(sql`ARRAY[]::varchar[]`),
  },
  (table) => [
    uniqueIndex("cart_items_unique_variant").on(
      table.cartId,
      table.productId,
      table.productVariant,
    ),

    check("cart_items_quantity_min_1", sql`${table.quantity} >= 1`),

    check(
      "cart_items_messages_not_exceed_quantity",
      sql`card_messages IS NULL OR array_length(${table.cardMessages}, 1) <= ${table.quantity}`,
    ),
  ],
);
