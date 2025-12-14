import { Hono } from "hono";
import {
  addProduct,
  deleteProducts,
  patchProduct,
} from "../contollers/index.ts";
import { cache } from "hono/cache";
import { isDev } from "@shared/utils/isDev.ts";
import {
  supabaseMiddleware,
  adminRoleMiddleware,
  authMiddleware,
} from "@shared/middlewares/mod.ts";
import { getSupabaseServiceRole } from "@shared/db/serviceRoleClient.ts";

const products = new Hono();

products.use("*", supabaseMiddleware());

// Cache getAllProducts -- hono cache doesn't work in dev mode so it's disabled in it
if (!isDev) {
  products.get(
    "/",
    cache({
      cacheName: "getAllProducts",
      cacheControl: "max-age=1800", // 30 mins
      wait: true, // for deno runtime
    }),
  );
}

// ------------------- ADMIN ONLY API's -------------------

products.delete("/", authMiddleware(), adminRoleMiddleware(), (c) => {
  const supabase = getSupabaseServiceRole(c);
  return deleteProducts(supabase, c);
});

products.post("/", authMiddleware(), adminRoleMiddleware(), (c) => {
  const supabase = getSupabaseServiceRole(c);
  return addProduct(supabase, c);
});

products.patch("/", authMiddleware(), adminRoleMiddleware(), (c) => {
  const supabase = getSupabaseServiceRole(c);
  return patchProduct(supabase, c);
});

// ------------------- ADMIN ONLY API's -------------------

export default products;
