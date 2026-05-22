import { getShippingOrder as _getShippingOrder } from "../../../integrations/lalamove/mod.ts";

export const getShippingOrder = async (id: string) => {
  return await _getShippingOrder(id);
};
