import { cancelShipmentOrder } from "./cancel-shipment-order.ts";
import { getOrders } from "./get-orders.ts";
import { getShippingOrder } from "./get-shipping-order.ts";
import { shipOrder } from "./ship-order.ts";

export const AdminActions = {
  getOrders,
  shipOrder,
  getShippingOrder,
  cancelShipmentOrder,
};
