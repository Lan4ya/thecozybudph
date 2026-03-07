import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY...");
  process.exit(1);
}

// Read CLI args: node createAdmin.js email@example.com password123
const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: ts-node createAdmin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
  // create user
  const {
    data: { user },
    error: signUpError,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so no manual step needed
  });

  if (signUpError) {
    console.error("Error creating user:", signUpError);
    process.exit(1);
  }

  if (!user) {
    console.error("Invariant error: createUser returned no data");
    process.exit(1);
  }

  // set role to admin
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: "admin" },
  });

  if (error) {
    console.error("Error setting role:", error);
    process.exit(1);
  }

  console.log("Admin user created:", user.id);
}

createAdmin();
