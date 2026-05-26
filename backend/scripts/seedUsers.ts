import { randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import pLimit from "p-limit";

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const USERS_TO_CREATE = 60;
const DEFAULT_PASSWORD = "password123";

const limit = pLimit(20);

async function deleteAllUsers() {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data.users;

    if (!users.length) {
      break;
    }

    await Promise.all(
      users.map((user) =>
        limit(async () => {
          const { error } = await supabase.auth.admin.deleteUser(user.id);

          if (error) {
            console.error(`Failed deleting ${user.email}:`, error.message);
            return;
          }

          console.log(`Deleted: ${user.email}`);
        }),
      ),
    );

    if (users.length < perPage) {
      break;
    }

    page++;
  }

  console.log("Done resetting all users.");
}

async function createUser() {
  const random = randomInt(1000, 100000);
  const email = `user${random}@local.dev`;

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: "Yoda",
    },
  });

  if (error) {
    if (error.code === "email_exists" && error.status === 422) {
      return {
        status: "duplicate" as const,
        email,
      };
    }

    return {
      status: "error" as const,
      email,
      error,
    };
  }

  return {
    status: "created" as const,
    email,
    userId: user?.id,
  };
}

async function main() {
  await deleteAllUsers();

  const results = await Promise.all(
    Array.from({ length: USERS_TO_CREATE }, () => limit(() => createUser())),
  );

  let created = 0;
  let duplicates = 0;
  let failed = 0;

  for (const result of results) {
    switch (result.status) {
      case "created":
        created++;
        console.log(`Created: ${result.email}`);
        break;

      case "duplicate":
        duplicates++;
        console.log(`Duplicate: ${result.email}`);
        break;

      case "error":
        failed++;
        console.error(`Failed: ${result.email}`, result.error.message);
        break;
    }
  }

  console.log("\n\x1b[32mDone seeding users.\x1b[0m");
  console.log("Created:", created);
  console.log("Duplicates:", duplicates);
  console.log("Failed:", failed);
}

await main();
