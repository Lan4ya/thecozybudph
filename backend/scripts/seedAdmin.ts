import { getRandomAvatarUrl } from "./helpers/getDefaultAvatarUrl.ts";
import { supabase } from "./helpers/supabase.ts";

export const ADMIN_EMAIL = "admin@local.dev";
export const ADMIN_PASSWORD = "password123";

export async function seedAdmin() {
  const avatar_url = await getRandomAvatarUrl();

  const {
    data: { user },
    error: error,
  } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // auto-confirm so no manual step needed
    app_metadata: { role: "admin" }, // set as admin
    user_metadata: { avatar_url }, // set default avatar
  });

  if (error) {
    if (
      "code" in error &&
      error.code === "email_exists" &&
      error.status === 422
    ) {
      console.log(`DB already has an admin user initialized:`);
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      return;
    }

    console.error("Error creating admin:", error);
    throw error;
  }

  if (!user) {
    console.error("Invariant error: createAdmin returned no data");
    throw new Error("createAdmin returned no data");
  }

  console.log(`Created admin:`);
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

if (process.argv[1] === import.meta.filename) {
  seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
