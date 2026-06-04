import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "@shared/types.d.ts";

import { registerAnalyticsRoutes } from "./admin-analytics-routes.ts";
import { registerOrderRoutes } from "./admin-order-routes.ts";
import { registerProductRoutes } from "./admin-product-routes.ts";
import { registerShipmentRoutes } from "./admin-shipment-routes.ts";

const admin = new OpenAPIHono<AppEnv>();

registerAnalyticsRoutes(admin);
registerOrderRoutes(admin);
registerProductRoutes(admin);
registerShipmentRoutes(admin);

export default admin;
