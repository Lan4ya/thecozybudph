import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/mod.ts";

const connectionString = Deno.env.get("SUPABASE_DB_URL")!;

const client = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(client, {
  schema, // casing: "snake_case",
});
