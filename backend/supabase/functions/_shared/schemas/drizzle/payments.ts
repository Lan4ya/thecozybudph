import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
  pgPolicy,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { orders } from "./orders.ts";
import { authenticatedRole } from "drizzle-orm/supabase/rls";
import { profiles } from "./profiles.ts";
import type { PaymentStatus } from "../types/index.ts";

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
    status: text("status").$type<PaymentStatus>().default("pending").notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    // Paymongo Details
    paymentIntentId: text("payment_intent_id").unique(),
    paymentId: text("payment_id").unique(),
    amountCents: integer("amount_cents"),
    method: text("method"),
  },
  (t) => [
    check(
      "payments_status_check",
      sql`${t.status} IN ('processing', 'pending', 'paid', 'failed', 'cancelled', 'refunded')`,
    ),

    check("payments_amount_cents_check", sql`${t.amountCents} >= 0`),

    uniqueIndex("payments_unique_active_per_order_profile")
      .on(t.orderId, t.profileId)
      .where(sql`${t.isActive} = true`),

    uniqueIndex("payments_unique_refunded_per_order")
      .on(t.orderId)
      .where(sql`${t.status} = 'refunded'`),

    uniqueIndex("payments_unique_pending_per_order")
      .on(t.orderId)
      .where(sql`${t.status} = 'pending'`),

    uniqueIndex("payments_unique_paid_per_order")
      .on(t.orderId)
      .where(sql`${t.status} = 'paid'`),

    pgPolicy("authenticated can select own payment", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("authenticated can update own payment", {
      as: "permissive",
      to: authenticatedRole,
      for: "update",
      using: sql`auth.uid() = profile_id`,
      withCheck: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("authenticated can initiate payments for active orders", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`
    auth.uid() = profile_id AND 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.expires_at > now()
    )`,
    }),
  ],
);
