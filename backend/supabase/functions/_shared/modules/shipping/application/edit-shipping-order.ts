import { editShippingOrder as _editShippingOrder } from "../../../integrations/lalamove/mod.ts";
import { EditShippingOrderInput } from "@shared/schemas/index.ts";

export const editShippingOrder = async (
  payload: EditShippingOrderInput,
) => {
  return await _editShippingOrder(payload);
};
