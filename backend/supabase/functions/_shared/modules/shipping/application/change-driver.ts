import { changeShippingDriver as _changeShippingDriver } from "../../../integrations/lalamove/mod.ts";
import { ChangeShippingDriverInput } from "@shared/schemas/index.ts";

export const changeShippingDriver = async (
  payload: ChangeShippingDriverInput,
) => {
  return await _changeShippingDriver(payload);
};
