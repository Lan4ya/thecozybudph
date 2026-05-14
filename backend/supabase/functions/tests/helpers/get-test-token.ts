import { SupabaseDB } from "@shared/types.d.ts";

let cachedUserToken: string | null = null;
export async function getTestToken(supabase: SupabaseDB) {
  if (cachedUserToken) return cachedUserToken;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "user@gmail.com",
    password: "user123",
  });

  if (error) throw new Error(error.message);

  cachedUserToken = data.session?.access_token!;
  return cachedUserToken;
}

let cachedAdminToken: string | null = null;
export async function getTestAdminToken(supabase: SupabaseDB) {
  if (cachedAdminToken) return cachedAdminToken;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  if (error) throw new Error(error.message);

  cachedAdminToken = data.session?.access_token!;
  return cachedAdminToken;
}
