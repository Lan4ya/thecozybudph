import Lalamove from "@lalamove/lalamove-js";
import { MARKET, sdkClient } from "./client.ts";

export const getShippingQuotation = async (
  id: string,
): Promise<Lalamove.IQuotation> => {
  return await sdkClient.Quotation.retrieve(MARKET, id);
};
