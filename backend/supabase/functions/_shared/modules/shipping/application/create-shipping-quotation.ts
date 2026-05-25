import { createShippingQuotation as _createShippingQuotation } from "../../../integrations/lalamove/mod.ts";
import { CreateShippingQuoteInput } from "@shared/schemas/index.ts";

export const createShippingQuotation = async (
  payload: CreateShippingQuoteInput,
) => {
  return await _createShippingQuotation(payload);
};
