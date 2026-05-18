import { Database } from "@cozybud/schemas";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY...");
  process.exit(1);
}

const EMAIL = "admin@local.dev";
const PASSWORD = "password123";

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

async function main() {
  const {
    data: { user },
    error: error,
  } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true, // auto-confirm so no manual step needed
    app_metadata: { role: "admin" }, // set as admin
  });

  if (error) {
    if (
      "code" in error &&
      error.code === "email_exists" &&
      error.status === 422
    ) {
      console.log(`DB already has an admin user initialized:`);
      console.log(`Email: ${EMAIL}`);
      console.log(`Password: ${PASSWORD}`);
      return;
    }

    console.error("Error creating admin:", error);
    process.exit(1);
  }

  if (!user) {
    console.error("Invariant error: createAdmin returned no data");
    process.exit(1);
  }

  console.log(`Created admin:`);
  console.log(`Email: ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
}

main();
