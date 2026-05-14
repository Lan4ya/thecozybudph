import { SupabaseDB } from "@shared/types.d.ts";

export async function signInUser(
  supabase: SupabaseDB,
  role?: "user" | "admin",
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  if (error) {
    throw new Error(`Auth failed: ${error.message}`);
  }

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("No token returned from Supabase");
  }

  return token;
}
