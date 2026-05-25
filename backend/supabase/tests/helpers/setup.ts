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

const TEST_RUN_ID = crypto.randomUUID();
export const TEST_ADMIN_EMAIL = `test-admin-${TEST_RUN_ID}@local.dev`;
export const TEST_USER_EMAIL = `test-user-${TEST_RUN_ID}@local.dev`;
export const TEST_PASSWORD = "password123";

export let adminUserId = "";
export let normalUserId = "";

async function createUser(params: {
  email: string;
  password: string;
  appMetadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabaseService.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    ...(params.appMetadata ? { app_metadata: params.appMetadata } : {}),
  });

  if (error) throw error;

  const userId = data.user?.id;

  if (!userId) {
    throw new Error(`No user returned for ${params.email}`);
  }

  return userId;
}

beforeAll(async () => {
  adminUserId = await createUser({
    email: TEST_ADMIN_EMAIL,
    password: TEST_PASSWORD,
    appMetadata: {
      role: "admin",
    },
  });

  normalUserId = await createUser({
    email: TEST_USER_EMAIL,
    password: TEST_PASSWORD,
  });
});

afterAll(async () => {
  // Explicitly stop any auth refresh timers that might have started
  // despite the config (known issue in some supabase-js versions)
  supabase.auth.stopAutoRefresh();
  supabaseService.auth.stopAutoRefresh();

  // delete users
  await Promise.all([
    supabaseService.auth.admin.deleteUser(adminUserId),
    supabaseService.auth.admin.deleteUser(normalUserId),
  ]);
  await adminPg.end();
});
