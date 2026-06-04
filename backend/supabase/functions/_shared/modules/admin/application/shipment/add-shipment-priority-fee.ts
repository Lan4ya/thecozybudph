import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { AddShippingOrderPriorityFeeInput } from "@shared/schemas/index.ts";

export const addShippingOrderPriorityFee = async (
  payload: AddShippingOrderPriorityFeeInput,
) => {
  return await Lalamove.addPriorityFee(payload);
};
