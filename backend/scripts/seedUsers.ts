import { randomInt } from "node:crypto";
import pLimit from "p-limit";
import { supabase } from "./helpers/supabase.ts";
import { getRandomAvatarUrl } from "./helpers/getDefaultAvatarUrl.ts";

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

async function createUser(email?: string) {
  const random = randomInt(1000, 100000);
  const userEmail = email ?? `user${random}@local.dev`;

  const avatar_url = await getRandomAvatarUrl();

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.createUser({
    email: userEmail,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: {
      avatar_url, // provide default avatar
    },
  });

  if (error) {
    if (error.code === "email_exists" && error.status === 422) {
      return {
        status: "duplicate" as const,
        email: userEmail,
      };
    }

    return {
      status: "error" as const,
      email: userEmail,
      error,
    };
  }

  return {
    status: "created" as const,
    email: userEmail,
    userId: user?.id,
  };
}

export async function seedUsers() {
  await deleteAllUsers();

  const results = await Promise.all(
    Array.from({ length: USERS_TO_CREATE }, (_, idx) =>
      limit(() => (idx === 0 ? createUser("user@local.dev") : createUser())),
    ),
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

if (process.argv[1] === import.meta.filename) {
  seedUsers().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
