import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../packages/schemas/src/drizzle/index.ts",
  out: "./supabase/migrations/",
  dialect: "postgresql",
});
