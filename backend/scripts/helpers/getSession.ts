import {
  createAdminOrGet,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
} from "./createAdminOrGet.ts";
import { supabase } from "./supabase.ts";

export async function getAdminSession() {
  await createAdminOrGet();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  });

  if (error) throw error;

  return data.session;
}
