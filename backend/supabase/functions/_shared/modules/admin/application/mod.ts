import { cancelShipmentOrder } from "./admin-cancel-shipment-order.ts";
import { getOrders } from "./admin-get-orders.ts";
import { getShippingOrder } from "./admin-get-shipping-order.ts";
import { shipOrder } from "./admin-ship-order.ts";

export const AdminActions = {
  getOrders,
  shipOrder,
  getShippingOrder,
  cancelShipmentOrder,
};
