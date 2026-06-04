import { createLalamoveQuotation } from "./create-lalamove-quotation.ts";
import { cancelLalamoveOrder } from "./cancel-lalamove-order.ts";
import { createLalamoveOrder } from "./create-lalamove-order.ts";
import { getLalamoveQuotation } from "./get-lalamove-quotation.ts";
import { editLalamoveOrder } from "./edit-lalamove-order.ts";
import { getLalamoveOrder } from "./get-lalamove-order.ts";
import { addLalamoveOrderPriorityFee } from "./add-lalamove-priority-fee.ts";
import { getLalamoveDriver } from "./get-lalamove-driver.ts";
import { changeLalamoveDriver } from "./change-lalamove-driver.ts";
import { getLalamoveMarket } from "./get-lalamove-market.ts";
import { getLalamoveCity } from "./get-lalamove-city.ts";

export const Lalamove = {
  createQuotation: createLalamoveQuotation,
  getQuotation: getLalamoveQuotation,
  createOrder: createLalamoveOrder,
  cancelOrder: cancelLalamoveOrder,
  editOrder: editLalamoveOrder,
  getOrder: getLalamoveOrder,
  addPriorityFee: addLalamoveOrderPriorityFee,
  getDriver: getLalamoveDriver,
  changeDriver: changeLalamoveDriver,
  getMarket: getLalamoveMarket,
  getCity: getLalamoveCity,
} as const;
