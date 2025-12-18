import "hono";
import { SupabaseClient } from "supabase";

declare module "hono" {
  interface ContextVariableMap {
    validatedPayload: unknown;
    supabase: SupabaseClient;
    role: "user" | "admin";
  }
}
