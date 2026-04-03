import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./supabase/functions/_shared/db/schema/",
  out: "./supabase/migrations/",
  dialect: "postgresql",
});
