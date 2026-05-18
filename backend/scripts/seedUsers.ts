import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const USERS_TO_CREATE = 60;
const DEFAULT_PASSWORD = "password123";

// Reset users
const deleteAllUsers = async () => {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const users = data.users;
    if (!users.length) break;

    await Promise.all(users.map((u) => supabase.auth.admin.deleteUser(u.id)));

    // stop on last page
    if (users.length < perPage) break;
    page++;
  }

  console.log("Done resetting all users.");
};

async function createUser() {
  const random = randomInt(1000, 10000);
  const email = `user${random}@local.dev`;

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    user_metadata: { name: "Yoda" },
    email_confirm: true,
  });

  if (error) {
    if (error.code === "email_exists" && error.status === 422) {
      return { status: "duplicate", email };
    }
    return { status: "error", error, email };
  }

  return { status: "created", email, userId: user?.id };
}

async function main() {
  await deleteAllUsers();

  const results = await Promise.all(
    Array.from({ length: USERS_TO_CREATE }, () => createUser()),
  );

  let created = 0;
  let duplicates = 0;

  for (const r of results) {
    if (r.status === "created") {
      created++;
      console.log(`Created: ${r.email}`);
    } else if (r.status === "duplicate") {
      duplicates++;
      console.log(`Duplicate: ${r.email}`);
    } else {
      console.error(`Error:`, r);
    }
  }

  console.log("\x1b[32mDone seeding users.\x1b[0m");
  console.log("Created:", created);
  console.log("Duplicates:", duplicates);
}

await main();
