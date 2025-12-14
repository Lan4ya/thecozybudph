import { createClient } from "@supabase/supabase-js";
import type { Database } from "@TheCozyBud/schema/src/db/supabase.types";

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
console.log({ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY });

export const supabase = createClient<Database>(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
);
