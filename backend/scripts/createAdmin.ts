import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY...");
  process.exit(1);
}

// Usage: pnpm tsx createAdmin.js email@example.com password123

// Read CLI args
const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: pnpm tsx createAdmin.ts <email> <password>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
  // Create user and set role to admin
  const {
    data: { user },
    error: createError,
  } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so no manual step needed
    app_metadata: { role: "admin" },
  });

  if (createError) {
    console.error("Error creating user:", createError);
    process.exit(1);
  }

  if (!user) {
    console.error("Invariant error: createUser returned no data");
    process.exit(1);
  }

  console.log("Admin user created.");
  console.log("user id: ", user.id);
}

createAdmin();
