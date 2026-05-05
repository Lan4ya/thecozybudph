import {
  adminMiddleware,
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";
import { Env, Hono } from "hono";
import {
  createProductHandler,
  deleteProductHandler,
  getOrdersHandler,
  cancelShipOrderHandler,
  getShippingOrderHandler,
  shipOrderHandler,
  updateProductHandler,
} from "./admin-handlers.ts";

const admin = new Hono<Env>();

admin.use(
  "*",
  supabaseMiddleware(),
  authMiddleware(),
  adminMiddleware(),
  supabaseServiceMiddleware(),
  drizzleMiddleware(),
);

// Order
admin.get("/order", ...getOrdersHandler);
admin.patch("/order/:id/shipment", ...shipOrderHandler);
admin.get("/order/:id/shipment", ...getShippingOrderHandler);
admin.delete("/order/:id/shipment", ...cancelShipOrderHandler);

// Product
admin.post("/product", ...createProductHandler);
admin.patch("/product/:id", ...updateProductHandler);
admin.delete("/product", ...deleteProductHandler);

export default admin;
