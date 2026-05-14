import { buildRoute } from "@shared/factory/mod.ts";
import {
  cancelShipOrderHandler,
  createProductHandler,
  deleteProductHandler,
  getOrdersHandler,
  getShippingOrderHandler,
  shipOrderHandler,
  updateProductHandler,
} from "./admin-handlers.ts";

export const buildAdminRoutes = () => {
  const admin = buildRoute({
    middlewares: ["supabase", "auth", "admin", "supabaseService", "drizzle"],
  });

  // Order
  admin.get("/order", ...getOrdersHandler);
  admin.patch("/order/:id/shipment", ...shipOrderHandler);
  admin.get("/order/:id/shipment", ...getShippingOrderHandler);
  admin.delete("/order/:id/shipment", ...cancelShipOrderHandler);

  // Product
  admin.post("/product", ...createProductHandler);
  admin.patch("/product/:id", ...updateProductHandler);
  admin.delete("/product", ...deleteProductHandler);

  return admin;
};

// const admin = new Hono<Env>();
//
// admin.use(
//   "*",
//   supabaseMiddleware(),
//   authMiddleware(),
//   adminMiddleware(),
//   supabaseServiceMiddleware(),
//   drizzleMiddleware(),
// );
//
// // Order
// admin.get("/order", ...getOrdersHandler);
// admin.patch("/order/:id/shipment", ...shipOrderHandler);
// admin.get("/order/:id/shipment", ...getShippingOrderHandler);
// admin.delete("/order/:id/shipment", ...cancelShipOrderHandler);
//
// // Product
// admin.post("/product", ...createProductHandler);
// admin.patch("/product/:id", ...updateProductHandler);
// admin.delete("/product", ...deleteProductHandler);
//
// export default admin;
