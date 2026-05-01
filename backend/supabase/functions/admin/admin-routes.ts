import { Hono, Env } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  updateProductHandler,
  getOrdersHandler,
} from "./admin-handlers.ts";
import {
  supabaseMiddleware,
  adminMiddleware,
  authMiddleware,
  supabaseServiceMiddleware,
  drizzleMiddleware,
} from "@shared/middlewares/mod.ts";

const admin = new Hono<Env>();

admin.use(
  "*",
  supabaseMiddleware(),
  authMiddleware(),
  adminMiddleware(),
  supabaseServiceMiddleware(),
  drizzleMiddleware(),
);

admin.get("/order", ...getOrdersHandler);

admin.post("/product", ...createProductHandler);
admin.patch("/product/:id", ...updateProductHandler);
admin.delete("/product", ...deleteProductHandler);

export default admin;
