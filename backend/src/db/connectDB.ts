import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export function initDB() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_KEY!;

  if (!url || !key) throw new Error("Missing Supabase credentials...");

  console.log("🚀 Supabase client initialized...");
  return (supabase = createClient(url, key));
}

export const getDB = () => supabase;
