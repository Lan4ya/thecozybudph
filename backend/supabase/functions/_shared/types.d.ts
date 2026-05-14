import { Database } from "@shared/schemas/index.ts";
import { JwtPayload, SupabaseClient } from "supabase";
import { DrizzleClient } from "./db/client.ts";

export type SupabaseDB = SupabaseClient<Database>;

export type Bindings = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  DB_TX_POOLER_URL?: string;
  APP_URL?: string;
};

export type Variables = {
  supabase?: SupabaseDB;
  supabaseService?: SupabaseClient<Database>;
  claims?: JwtPayload;
  isAdmin?: boolean;
  db?: DrizzleClient;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
