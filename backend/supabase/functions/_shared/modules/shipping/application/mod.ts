import {
  createShippingQuotation,
  getShippingOrder,
} from "@shared/integrations/lalamove/mod.ts";
import { shipOrder } from "@shared/modules/admin/application/admin-ship-order.ts";
import { cancelShipmentOrder } from "@shared/modules/shipping/application/cancel-shipment-order.ts";

export const ShippingActions = {
  createShippingQuotation,
  shipOrder,
  cancelShipmentOrder,
  getShippingOrder,
};
