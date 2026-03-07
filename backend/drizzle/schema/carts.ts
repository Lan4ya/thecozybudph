import {
  pgTable,
  uuid,
  integer,
  varchar,
  check,
  unique,
  uniqueIndex,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.ts";
import { index } from "drizzle-orm/pg-core";
import { products, productVariants } from "./products.ts";

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
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id").references(() => carts.id, {
      onDelete: "cascade",
    }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productVariantId: uuid("product_variant_id").references(
      () => productVariants.id,
      { onDelete: "set null" },
    ),
    quantity: integer("quantity").notNull(),
    cardMessages: varchar("card_messages", { length: 600 })
      .array()
      .notNull()
      .default(sql`ARRAY[]::varchar[]`),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("cart_items_unique_variant").on(
      table.cartId,
      table.productId,
      table.productVariantId,
    ),

    check("cart_items_quantity_min_1", sql`${table.quantity} >= 1`),

    check(
      "cart_items_messages_not_exceed_quantity",
      sql`card_messages IS NULL OR array_length(${table.cardMessages}, 1) <= ${table.quantity}`,
    ),
  ],
);
