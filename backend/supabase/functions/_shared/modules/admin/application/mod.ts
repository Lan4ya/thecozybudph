import { queryOrders } from "./admin-query-orders.ts";
import { getAnalytics } from "./admin-get-analytics.ts";
import { ShipmentActions } from "@shared/modules/admin/application/shipment/mod.ts";
import { getOrder } from "@shared/modules/admin/application/admin-get-order.ts";

export const AdminActions = {
  queryOrders,
  getOrder,
  getAnalytics,
  ...ShipmentActions,
};
