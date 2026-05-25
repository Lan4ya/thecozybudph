import { addShippingOrderPriorityFee as _addShippingOrderPriorityFee } from "../../../integrations/lalamove/mod.ts";
import { AddShippingOrderPriorityFeeInput } from "@shared/schemas/index.ts";

export const addShippingOrderPriorityFee = async (
  payload: AddShippingOrderPriorityFeeInput,
) => {
  return await _addShippingOrderPriorityFee(payload);
};
