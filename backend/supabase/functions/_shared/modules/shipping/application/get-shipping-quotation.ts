import { getShippingQuotation as _getShippingQuotation } from "../../../integrations/lalamove/mod.ts";

export const getShippingQuotation = async (id: string) => {
  return await _getShippingQuotation(id);
};
