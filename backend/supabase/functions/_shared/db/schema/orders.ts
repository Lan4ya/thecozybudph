import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.ts";
import { products } from "./products.ts";
import { carts } from "./carts.ts";
import { addresses } from "./addresses.ts";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "set null" }),
    status: text("status").default("pending").notNull(),
    addressId: uuid("address_id").references(() => addresses.id, {
      onDelete: "set null",
    }),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    cartId: uuid("cart_id").references(() => carts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("orders_discount_cents_check", sql`${table.discountCents} >= 0`),
    check("orders_shipping_cents_check", sql`${table.shippingCents} >= 0`),
    check("orders_subtotal_cents_check", sql`${table.subtotalCents} >= 0`),
    check("orders_total_cents_check", sql`${table.totalCents} >= 0`),
    check(
      "orders_status_check",
      sql`${table.status} IN ('created', 'awaiting_payment', 'confirmed', 'fulfilling', 'fulfilled', 'cancelled')`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    priceCents: integer("price_cents").notNull(),
  },
  (table) => [
    check("order_items_price_cents_check", sql`${table.priceCents} >= 0`),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
  ],
);
