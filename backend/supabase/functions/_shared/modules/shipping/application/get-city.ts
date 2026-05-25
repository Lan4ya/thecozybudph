import { getShippingCity as _getShippingCity } from "../../../integrations/lalamove/mod.ts";
import { GetShippingCityInput } from "@shared/schemas/index.ts";

export const getShippingCity = async (
  payload: GetShippingCityInput,
) => {
  return await _getShippingCity(payload);
};
