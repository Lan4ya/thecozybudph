import { Hono, Env } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  patchProductHandler,
} from "./product-handlers.ts";
import {
  supabaseMiddleware,
  roleMiddleware,
  authMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";

const product = new Hono<Env>();

// ------------------- ADMIN ONLY API's -------------------

product.use("*", supabaseMiddleware());
product.use("*", authMiddleware());
product.use("*", roleMiddleware("admin"));
product.use("*", supabaseServiceMiddleware());

product.post("/", ...createProductHandler);
product.patch("/", ...patchProductHandler);
product.delete("/", ...deleteProductHandler);

export default product;
