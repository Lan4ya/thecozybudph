import { Address } from "@shared/package-types/index.ts";
import { UpdateAddress } from "../../../db/types/addresses.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const updateAddress = async (
  db: DrizzleClient,
  id: string,
  payload: UpdateAddress,
): Promise<Address> => {
  let address: Address;
  try {
    address = await AddressRepository.update(db, id, payload);
  } catch (error) {
    throw handleDbError("Failed to update address", error);
  }
  return address;
};
