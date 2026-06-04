import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { GetShippingDriverInput } from "@shared/schemas/index.ts";

export const getShipmentDriver = async (payload: GetShippingDriverInput) => {
  return await Lalamove.getDriver(payload);
};
