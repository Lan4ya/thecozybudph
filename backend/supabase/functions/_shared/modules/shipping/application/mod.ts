export { createShippingQuotation } from "./create-shipping-quotation.ts";
export { getShippingQuotation } from "./get-shipping-quotation.ts";
export { getShippingOrder } from "./get-shipping-order.ts";
export { cancelShipmentOrder } from "./cancel-shipment-order.ts";
export { addShippingOrderPriorityFee } from "./add-priority-fee.ts";
export { changeShippingDriver } from "./change-driver.ts";
export { getShippingDriver } from "./get-driver.ts";
export { getShippingCity } from "./get-city.ts";
export { getShippingMarket } from "./get-market.ts";
export { editShippingOrder } from "./edit-shipping-order.ts";
export { shipOrder } from "./ship-order.ts";

import { createShippingQuotation } from "./create-shipping-quotation.ts";
import { getShippingQuotation } from "./get-shipping-quotation.ts";
import { getShippingOrder } from "./get-shipping-order.ts";
import { cancelShipmentOrder } from "./cancel-shipment-order.ts";
import { addShippingOrderPriorityFee } from "./add-priority-fee.ts";
import { changeShippingDriver } from "./change-driver.ts";
import { getShippingDriver } from "./get-driver.ts";
import { getShippingCity } from "./get-city.ts";
import { getShippingMarket } from "./get-market.ts";
import { editShippingOrder } from "./edit-shipping-order.ts";
import { shipOrder } from "./ship-order.ts";

export const ShippingActions = {
  createShippingQuotation,
  getShippingQuotation,
  getShippingOrder,
  cancelShipmentOrder,
  addShippingOrderPriorityFee,
  changeShippingDriver,
  getShippingDriver,
  getShippingCity,
  getShippingMarket,
  editShippingOrder,
  shipOrder,
};
