import { getRandomAvatarUrl } from "./getDefaultAvatarUrl.ts";
import { supabase } from "./supabase.ts";

export const TEST_ADMIN_EMAIL = "admin@local.dev";
export const TEST_ADMIN_PASSWORD = "password123";

export async function createAdminOrGet() {
  try {
    const avatar_url = await getRandomAvatarUrl();

    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
        email_confirm: true, // auto-confirm so no manual step needed
        app_metadata: { role: "admin" }, // set as admin
        user_metadata: { avatar_url }, // set default avatar
      });

    if (createError) throw createError;

    return {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      user: created.user,
    };
  } catch {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    });

    if (error) throw error;

    return {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      user: data.session.user,
    };
  }
}
