import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  // profiles.id will reference auth.users.id from supabase although
  // through manual sql since auth schema is managed internally by supabase and
  // can't be imported here.
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
});
