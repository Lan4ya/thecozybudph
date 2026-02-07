import { AppError } from "@shared/errors/Errors.ts";
import { Context, Hono } from "hono";
import { isDev } from "@shared/utils/isDev.ts";
import { handleError } from "@shared/middlewares/errorHandler.ts";
import { logger } from "hono/logger";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";

// WARN: This function is only for local environment only. DO NOT deploy it. It's
// only purpose is for quick testing. the endpoints below are fully handled
// on the client side with proper RLS.

const dev = new Hono().basePath("dev-only");

dev.use(logger());
dev.use("*", supabaseMiddleware());

dev.post("/auth/signup", async (c: Context) => {
  // if (!isDev) throw new Error("Dev ednpoint only");

  const s = c.get("supabase");
  const { email, password } = await c.req.json();
  const { data, error } = await s.auth.signUp({ email, password });
  if (error) throw error;
  return c.json(data);
});

dev.post("/auth/login", async (c: Context) => {
  // if (!isDev) throw new Error("Dev ednpoint only");

  const s = c.get("supabase");
  const { email, password } = await c.req.json();
  const { data, error } = await s.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c.json(data);
});

dev.get("/products", async (c: Context) => {
  // if (!isDev) throw new Error("dev endpoint only");

  const s = c.get("supabase");
  const { data: products, error } = await s.from("products").select(`
    *,
    product_collections (name)
    product_categories (name)
  `);
  if (error) throw error;
  if (!products) throw AppError.notFound(`No Products found`);
  return c.json(
    {
      product: products,
      success: true,
    },
    200,
  );
});

dev.notFound((c) => c.text("Not Found"));
dev.onError((err) => handleError(err));

Deno.serve(dev.fetch);
