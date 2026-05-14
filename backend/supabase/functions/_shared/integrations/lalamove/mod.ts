export { createShippingQuotation } from "./create-shipping-quotation.ts";
export { getShippingQuotation } from "./get-shipping-quotation.ts";
export { createShippingOrder } from "./create-shipping-order.ts";
export { editShippingOrder } from "./edit-order.ts";
export { getShippingOrder } from "./get-shipping-order.ts";
export { cancelShippingOrder } from "./cancel-order.ts";
export { addShippingOrderPriorityFee } from "./add-priority-fee.ts";
export { getShippingDriver } from "./get-driver.ts";
export { changeShippingDriver } from "./change-driver.ts";
export { getShippingMarket } from "./get-market.ts";
export { getShippingCity } from "./get-city.ts";

import { createShippingQuotation } from "./create-shipping-quotation.ts";
import { getShippingQuotation } from "./get-shipping-quotation.ts";
import { createShippingOrder } from "./create-shipping-order.ts";
import { editShippingOrder } from "./edit-order.ts";
import { getShippingOrder } from "./get-shipping-order.ts";
import { cancelShippingOrder } from "./cancel-order.ts";
import { addShippingOrderPriorityFee } from "./add-priority-fee.ts";
import { getShippingDriver } from "./get-driver.ts";
import { changeShippingDriver } from "./change-driver.ts";
import { getShippingMarket } from "./get-market.ts";
import { getShippingCity } from "./get-city.ts";

export const LalamoveActions = {
  createShippingQuotation,
  getShippingQuotation,
  createShippingOrder,
  editShippingOrder,
  getShippingOrder,
  cancelShippingOrder,
  addShippingOrderPriorityFee,
  getShippingDriver,
  changeShippingDriver,
  getShippingMarket,
  getShippingCity,
};
