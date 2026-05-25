import { getShippingDriver as _getShippingDriver } from "../../../integrations/lalamove/mod.ts";
import { GetShippingDriverInput } from "@shared/schemas/index.ts";

export const getShippingDriver = async (
  payload: GetShippingDriverInput,
) => {
  return await _getShippingDriver(payload);
};
