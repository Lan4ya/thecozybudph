import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { EditShippingOrderInput } from "@shared/schemas/index.ts";

export const editShipmentOrder = async (payload: EditShippingOrderInput) => {
  return await Lalamove.editOrder(payload);
};
