import { MARKET, sdkClient } from "./client.ts";
import { AppError } from "../../errors/Errors.ts";

type GetQuotationResult = Awaited<
  ReturnType<typeof sdkClient.Quotation.retrieve>
>;

export const getShippingQuotation = async (
  id: string,
): Promise<GetQuotationResult> => {
  try {
    return await sdkClient.Quotation.retrieve(MARKET, id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping quote";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
