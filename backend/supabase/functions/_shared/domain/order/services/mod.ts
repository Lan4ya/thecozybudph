import { createShippingQuotation } from "../../../integrations/lalamove/create-quotation.ts";
import { createOrder } from "./create-order.ts";

export const OrderService = {
  createOrder,
  createShippingQuotation,
};
