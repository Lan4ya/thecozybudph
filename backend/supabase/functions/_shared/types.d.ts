import { JwtPayload, SupabaseClient } from "supabase";
import { DrizzleClient } from "./db/client.ts";
import { Database } from "@shared/schemas/index.ts";

export type SupabaseType = SupabaseClient<Database>;

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  supabase?: SupabaseType;
  supabaseService?: SupabaseClient<Database>;
  claims?: JwtPayload;
  // for simplicity of this project, there's no role based hierarchy. either
  // user is admin or not.
  isAdmin?: boolean;
  db?: DrizzleClient;
};

export type AppEnv = {
  Bindings?: Bindings;
  Variables: Variables;
};
