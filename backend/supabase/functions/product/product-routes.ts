import { Hono, Env } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  updateProductHandler,
} from "./product-handlers.ts";
import {
  supabaseMiddleware,
  adminMiddleware,
  authMiddleware,
  supabaseServiceMiddleware,
  drizzleMiddleware,
} from "@shared/middlewares/mod.ts";

const products = new Hono<Env>();

products.use("*", supabaseMiddleware());
products.use("*", authMiddleware());
products.use("*", adminMiddleware());
products.use("*", supabaseServiceMiddleware());
products.use("*", drizzleMiddleware());

// ------------------- ADMIN ONLY API's -------------------

products.post("/", ...createProductHandler);
products.patch("/:id", ...updateProductHandler);
products.delete("/", ...deleteProductHandler);

// ------------------- ADMIN ONLY API's -------------------

export default products;
