import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.ts";
import { authenticatedRole, anonRole } from "drizzle-orm/supabase/rls";
import type { DBEventInquiryStatus } from "../types/db/event.ts";

export const eventInquiries = pgTable(
  "event_inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    eventType: text("event_type").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    guestCount: integer("guest_count"),
    venue: text("venue"),
    budget: text("budget"),
    message: text("message").notNull(),
    status: text("status")
      .$type<DBEventInquiryStatus>()
      .default("new")
      .notNull(),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    check(
      "event_inquiries_status_check",
      sql`${table.status} IN ('new', 'contacted', 'quoted', 'closed')`,
    ),

    pgPolicy("authenticated can select own inquiry", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("authenticated can insert own inquiry", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("anon can insert inquiry", {
      as: "permissive",
      to: anonRole,
      for: "insert",
      withCheck: sql`profile_id IS NULL`,
    }),
  ],
);
