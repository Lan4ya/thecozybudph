import { JwtPayload, SupabaseClient } from "supabase";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  validatedPayload: unknown;
  supabase: SupabaseClient;
  supabaseService: SupabaseClient;
  role: "user" | "admin";
  claims: JwtPayload;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
