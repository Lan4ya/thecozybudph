import { createShipmentQuotation } from "./create-shipment-quotation.ts";
import { getShippingQuotation } from "./get-shipment-quotation.ts";
import { getShipmentOrder } from "./get-shipment-order.ts";
import { cancelShipmentOrder } from "./cancel-shipment-order.ts";
// import { addShippingOrderPriorityFee } from "./add-shipment-priority-fee.ts";
import { changeShipmentDriver } from "./change-shipment-driver.ts";
import { getShipmentDriver } from "./get-shipment-driver.ts";
// import { getShippingCity } from "./get-city.ts";
// import { getShippingMarket } from "./get-market.ts";
import { editShipmentOrder } from "./edit-shipment-order.ts";
import { createShipmentOrder } from "./create-shipment-order.ts";
import { handleShipmentWebhook } from "./handle-shipment-webhook.ts";

export const ShipmentActions = {
  createShipmentQuotation,
  handleShipmentWebhook,
  getShippingQuotation,
  getShipmentOrder,
  cancelShipmentOrder,
  // addShippingOrderPriorityFee,
  changeShipmentDriver,
  getShipmentDriver,
  // getShippingCity,
  // getShippingMarket,
  editShipmentOrder,
  createShipmentOrder,
};
