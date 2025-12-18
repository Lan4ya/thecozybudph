import { zodValidatorMiddleware } from "@shared/middlewares/mod.ts";
import { Hono, Env } from "hono";
import { createProductHandlers } from "./handlers.ts";
import {
  supabaseMiddleware,
  roleMiddleware,
  authMiddleware,
} from "@shared/middlewares/mod.ts";
import { getSupabaseServiceRole } from "@shared/db/serviceRoleClient.ts";
import {
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
} from "@shared/schema/index.ts";

const product = new Hono<Env>();

product.use("*", supabaseMiddleware());

// ------------------- ADMIN ONLY API's -------------------

product.delete(
  "/",
  authMiddleware(),
  roleMiddleware("admin"),
  zodValidatorMiddleware("json", deleteProductSchema),
  (c) => {
    const handlers = createProductHandlers({
      supabase: getSupabaseServiceRole(c),
    });
    return handlers.delete(c.req.valid("json"));
  },
);

product.post(
  "/",
  authMiddleware(),
  roleMiddleware("admin"),
  zodValidatorMiddleware("form", createProductSchema),
  (c) => {
    const handlers = createProductHandlers({
      supabase: getSupabaseServiceRole(c),
    });
    return handlers.create(c.req.valid("form"));
  },
);

product.patch(
  "/",
  authMiddleware(),
  roleMiddleware("admin"),
  zodValidatorMiddleware("form", updateProductSchema),
  (c) => {
    const handlers = createProductHandlers({
      supabase: getSupabaseServiceRole(c),
    });
    return handlers.update(c.req.valid("form"));
  },
);

export default product;
