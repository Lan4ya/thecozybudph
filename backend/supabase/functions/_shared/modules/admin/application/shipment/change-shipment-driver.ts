import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { ChangeShippingDriverInput } from "@shared/schemas/index.ts";

export const changeShipmentDriver = async (
  payload: ChangeShippingDriverInput,
): Promise<boolean> => {
  return await Lalamove.changeDriver(payload);
};
