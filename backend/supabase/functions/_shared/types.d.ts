import { JwtPayload, SupabaseClient } from "supabase";
import { Database } from "./schema/index.ts";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  validatedPayload: unknown;
  supabase: SupabaseClient<Database>;
  supabaseService: SupabaseClient<Database>;
  role: "user" | "admin";
  claims: JwtPayload;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

export type SupabaseType = AppEnv["Variables"]["supabase"];
