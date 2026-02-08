import { Hono, Env } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  patchProductHandler,
} from "./product-handlers.ts";
import {
  supabaseMiddleware,
  adminMiddleware,
  authMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";

const products = new Hono<Env>();

products.use("*", supabaseMiddleware());
products.use("*", authMiddleware());
products.use("*", adminMiddleware());
products.use("*", supabaseServiceMiddleware());

// ------------------- ADMIN ONLY API's -------------------

products.post("/", ...createProductHandler);
products.patch("/:id", ...patchProductHandler);
products.delete("/", ...deleteProductHandler);

// ------------------- ADMIN ONLY API's -------------------

export default products;
