import { createShippingQuotation } from "../../../integrations/lalamove/create-quotation.ts";
import { createOrder } from "./create-order.ts";
import { getOrder } from "./get-order.ts";

export const OrderActions = {
  createOrder,
  getOrder,
  createShippingQuotation,
};
