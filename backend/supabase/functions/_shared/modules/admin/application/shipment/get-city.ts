import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { GetShippingCityInput } from "@shared/schemas/index.ts";

export const getShippingCity = async (payload: GetShippingCityInput) => {
  return await Lalamove.getCity(payload);
};
