import Lalamove from "@lalamove/lalamove-js";
import { MARKET, sdkClient } from "./client.ts";
import { AppError } from "../../errors/Errors.ts";

export const getShippingQuotation = async (
  id: string,
): Promise<Lalamove.IQuotation> => {
  try {
    return await sdkClient.Quotation.retrieve(MARKET, id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping quote";
    throw new AppError(500, message, error);
  }
};
