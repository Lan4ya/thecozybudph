import { sql } from "drizzle-orm";
import { pgTable, timestamp, text, integer, check } from "drizzle-orm/pg-core";

export const imageSnapshots = pgTable(
  "image_snapshots",
  {
    hash: text("hash").primaryKey(),
    // storagePath: text("storage_path"),
    // mimeType: text("mime_type"),
    refCount: integer("ref_count").notNull().default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "image_snapshots_ref_count_non_negative",
      sql`${table.refCount} >= 0`,
    ),
  ],
);
