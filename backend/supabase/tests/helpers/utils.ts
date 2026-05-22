import { supabase } from "@shared/db/client.ts";
import { TEST_ADMIN_EMAIL, TEST_PASSWORD, TEST_USER_EMAIL } from "./setup.ts";

type CachedAuth = {
  accessToken: string;
  expiresAt: number;
};

let cachedUserAuth: CachedAuth | null = null;
let cachedAdminAuth: CachedAuth | null = null;

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;
  const expiresAt = data.session?.expires_at;

  if (!accessToken || !expiresAt) {
    throw new Error("Missing auth session");
  }

  return {
    accessToken,
    expiresAt,
  };
}

function isValidCache(cache: CachedAuth | null) {
  if (!cache) return false;

  // small safety buffer
  return Date.now() < cache.expiresAt * 1000 - 5000;
}

export async function getTestToken() {
  if (cachedUserAuth && isValidCache(cachedUserAuth)) {
    return cachedUserAuth.accessToken;
  }

  cachedUserAuth = await signIn(TEST_USER_EMAIL, TEST_PASSWORD);

  return cachedUserAuth.accessToken;
}

export async function getTestAdminToken() {
  if (cachedAdminAuth && isValidCache(cachedAdminAuth)) {
    return cachedAdminAuth.accessToken;
  }

  cachedAdminAuth = await signIn(TEST_ADMIN_EMAIL, TEST_PASSWORD);

  return cachedAdminAuth.accessToken;
}
