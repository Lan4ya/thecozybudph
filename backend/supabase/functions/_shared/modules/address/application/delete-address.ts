import { AddressRepository } from "@shared/modules/address/address-repository.ts";
import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { DeleteAddressData } from "@shared/schemas/index.ts";

export const deleteAddress = async (
  db: DrizzleClient,
  addressId: string,
  profileId: string,
): Promise<DeleteAddressData> => {
  const address = await AddressRepository.delete(db, addressId, profileId);
  if (!address) throw AppError.notFound({ message: "Address not found" });
  return { id: address.id };
};
