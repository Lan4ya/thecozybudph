import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { CreateShippingQuoteInput } from "@shared/schemas/index.ts";
import { AddressRepository } from "@shared/modules/address/address-repository.ts";
import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const createShipmentQuotation = async (
  db: DrizzleClient,
  payload: CreateShippingQuoteInput,
) => {
  const [recipientAddress, senderAddress] = await Promise.all([
    AddressRepository.getByIdWithCoords(db, payload.recipientAddressId),
    AddressRepository.getCompanyWithCoords(db),
  ]);

  if (!recipientAddress) {
    throw AppError.badRequest({ message: "Address not found" });
  }

  if (!senderAddress) {
    throw AppError.internal({
      cause: "Invariant violation: Company address not found or missing",
    });
  }

  console.log({ senderAddress, recipientAddress });

  return await Lalamove.createQuotation({ senderAddress, recipientAddress });
};
