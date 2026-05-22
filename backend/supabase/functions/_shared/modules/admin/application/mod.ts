import { getOrders } from "./admin-get-orders.ts";
import { shipOrder } from "./admin-ship-order.ts";
import { cancelShipmentOrder } from "@shared/modules/shipping/application/cancel-shipment-order.ts";
import { getShippingOrder } from "@shared/integrations/lalamove/mod.ts";

export const AdminActions = {
  getOrders,
  shipOrder,
  getShippingOrder,
  cancelShipmentOrder,
};
