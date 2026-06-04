import { Lalamove } from "@shared/integrations/lalamove/mod.ts";

export const getShippingMarket = async () => {
  return await Lalamove.getMarket();
};
