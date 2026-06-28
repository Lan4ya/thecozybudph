import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
  pgPolicy,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { orders } from "./orders.ts";
import { authenticatedRole } from "drizzle-orm/supabase/rls";
import { profiles } from "./profiles.ts";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "set null" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "set null" }),

    currency: text("currency").default("PHP").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    // Paymongo Details
    paymentIntentId: text("payment_intent_id").unique(),
    paymentId: text("payment_id").unique(),
    amountCents: integer("amount_cents"),
    method: text("method"),
  },
  (t) => [
    check("payments_amount_cents_check", sql`${t.amountCents} >= 0`),

    uniqueIndex("payments_unique_per_order").on(t.orderId),

    pgPolicy("authenticated can select own payment", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`(select auth.uid()) = profile_id`,
    }),

    pgPolicy("authenticated can update own payment", {
      as: "permissive",
      to: authenticatedRole,
      for: "update",
      using: sql`(select auth.uid()) = profile_id`,
      withCheck: sql`(select auth.uid()) = profile_id`,
    }),

    pgPolicy("authenticated can initiate payments for active orders", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`
    (select auth.uid()) = profile_id AND 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.expires_at > now()
    )`,
    }),
  ],
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));
