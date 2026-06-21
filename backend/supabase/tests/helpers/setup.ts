/*
 * This file is preloaded when running tests
 */

import { load } from "@std/dotenv";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../../.env", import.meta.url));

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

  // Create company address if it doesn't exist
  try {
    const [existing] = await adminPg`
      SELECT id FROM addresses WHERE is_company_address = true LIMIT 1
    `;

    if (!existing) {
      await adminPg`
        INSERT INTO addresses (
          profile_id,
          full_name,
          postal_code,
          region,
          city,
          province,
          barangay,
          address_line,
          phone_number,
          is_default,
          is_company_address,
          latitude,
          longitude
        ) VALUES (
          null,
          'The Cozy Bud',
          '1550',
          'NCR',
          'Mandaluyong',
          'Metro Manila',
          'Barangka Ilaya',
          'Edsa Corner Pioneer Street',
          '+639170000000',
          true,
          true,
          14.5739000,
          121.0447000
        )
      `.catch((err) => {
        // Handle race condition where another test might have inserted it
        // after our SELECT check but before our INSERT.
        // Postgres error code 23505 is unique_violation.
        if (err.code === "23505") return;
        throw err;
      });
    }
  } catch (err) {
    console.error("Failed to seed company address:", err);
    throw err;
  }
});

afterAll(async () => {
  supabase.auth.stopAutoRefresh();
  supabaseService.auth.stopAutoRefresh();

  // Try to delete users, ignore if already gone
  try {
    await Promise.all([
      supabaseService.auth.admin.deleteUser(adminUserId),
      supabaseService.auth.admin.deleteUser(normalUserId),
    ]);
  } catch {}

  await adminPg.end();
});
