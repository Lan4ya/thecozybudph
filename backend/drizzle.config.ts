import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema/",
  out: "./supabase/migrations/",
  dialect: "postgresql",
});
