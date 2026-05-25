import { getShippingMarket as _getShippingMarket } from "../../../integrations/lalamove/mod.ts";

export const getShippingMarket = async () => {
  return await _getShippingMarket();
};
