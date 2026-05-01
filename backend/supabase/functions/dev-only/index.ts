import { AppError } from "@shared/errors/Errors.ts";
import { handleError } from "@shared/errors/errorHandler.ts";
import { supabaseMiddleware } from "@shared/middlewares/supabaseMiddleware.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { AppEnv } from "@shared/types.d.ts";
import { requireVariables } from "@shared/utils/mod.ts";

// WARN: This function is only for local environment only. DO NOT deploy it. It's
// only purpose is for quick testing and are not needed in production.
const dev = new Hono<AppEnv>().basePath("dev-only");

dev.use("*", supabaseMiddleware());
dev.use(logger());

dev.post("/auth/signup", async (c: Context) => {
  if (!isDev) throw new Error("Dev ednpoint only");

  const s = c.get("supabase");
  const { email, password } = await c.req.json();
  const { data, error } = await s.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return c.json(data);
});

dev.post("/auth/login", async (c: Context<AppEnv>) => {
  if (!isDev) throw new Error("Dev ednpoint only");

  const { supabase: s } = requireVariables(c, "supabase");
  const { email, password } = await c.req.json();
  const { data, error } = await s.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c.json(data);
});

dev.get("/orders", async (c: Context) => {
  if (!isDev) throw new Error("dev endpoint only");

  const s = c.get("supabase");
  const { data: orders, error } = await s.from("orders").select("*");

  if (error) throw error;
  if (!orders) throw AppError.notFound(`No Orders found`);

  return c.json({ orders }, 200);
});

dev.get("/payments", async (c: Context) => {
  if (!isDev) throw new Error("dev endpoint only");

  const s = c.get("supabase");
  const { data: payments, error } = await s.from("payments").select("*");

  if (error) throw error;
  if (!payments) throw AppError.notFound(`No Payments found`);

  return c.json({ payments }, 200);
});

dev.get("/products", async (c: Context) => {
  if (!isDev) throw new Error("dev endpoint only");

  const s = c.get("supabase");
  const { data: products, error } = await s.from("products").select(`
    *,
    product_variants(*),
    product_collections (name),
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
