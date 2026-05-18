/*
 * This file is preloaded when running tests
 */

import { load } from "@std/dotenv";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(
  new URL("../../../../backend/.env", import.meta.url),
);

await load({
  envPath,
  export: true,
});

import { afterAll, beforeAll } from "@std/testing/bdd";

const { adminPg, supabase, supabaseService } =
  await import("@shared/db/client.ts");

export const TEST_ADMIN_EMAIL = "test-admin@local.dev";
export const TEST_USER_EMAIL = "test-user@local.dev";
export const TEST_PASSWORD = "password123";

export let adminUserId = "";
export let normalUserId = "";

async function findOrCreateUser(params: {
  email: string;
  password: string;
  appMetadata?: Record<string, unknown>;
}) {
  const { data: usersRes, error: listError } =
    await supabaseService.auth.admin.listUsers();

  if (listError) throw listError;

  const existing = usersRes.users.find((user) => user.email === params.email);

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabaseService.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    ...(params.appMetadata ? { app_metadata: params.appMetadata } : {}),
  });

  if (error) {
    console.error("[CREATE USER ERROR]", error);
    throw error;
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error(`Invariant failed: no user returned for ${params.email}`);
  }

  return userId;
}

beforeAll(async () => {
  adminUserId = await findOrCreateUser({
    email: TEST_ADMIN_EMAIL,
    password: TEST_PASSWORD,
    appMetadata: {
      role: "admin",
    },
  });

  normalUserId = await findOrCreateUser({
    email: TEST_USER_EMAIL,
    password: TEST_PASSWORD,
  });
});

afterAll(async () => {
  // Explicitly stop any auth refresh timers that might have started
  // despite the config (known issue in some supabase-js versions)
  supabase.auth.stopAutoRefresh();
  supabaseService.auth.stopAutoRefresh();

  await adminPg.end();
});
