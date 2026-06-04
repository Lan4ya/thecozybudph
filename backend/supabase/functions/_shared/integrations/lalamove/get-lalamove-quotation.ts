import { MARKET, sdkClient } from "./client.ts";
import { AppError } from "../../errors/Errors.ts";

type GetQuotationResult = Awaited<
  ReturnType<typeof sdkClient.Quotation.retrieve>
>;

/**
 * Retrieves the details of a previously generated Lalamove quotation.
 *
 * Quotations are temporary. This retrieves the breakdown of costs,
 * expected distance, and service type for a specific quote ID.
 *
 * @param id - The unique Lalamove Quotation ID.
 * @returns Quotation details including price breakdown and stops.
 */
export const getLalamoveQuotation = async (
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
