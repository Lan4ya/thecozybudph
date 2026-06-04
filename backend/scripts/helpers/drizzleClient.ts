import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzleSchemas } from "@cozybud/schemas";

const { SUPABASE_DB_URL } = process.env;

const adminPg = postgres(SUPABASE_DB_URL!, {
  prepare: false, // prepared statements are not supported in serverless
});

export const db = drizzle(adminPg, {
  schema: drizzleSchemas,
});
