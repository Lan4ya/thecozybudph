import { Lalamove } from "@shared/integrations/lalamove/mod.ts";

export const getShippingQuotation = async (id: string) => {
  return await Lalamove.getQuotation(id);
};
