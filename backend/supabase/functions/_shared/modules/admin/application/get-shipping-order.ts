import { getShippingOrder as getOrder } from "../../../integrations/lalamove/get-order.ts";

export const getShippingOrder = async (id: string) => {
  return await getOrder(id);
};
