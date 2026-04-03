import { DrizzleClient } from "../../../db/client.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { Address } from "../../../types/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getAddresses = async (
  db: DrizzleClient,
  profileId: string,
): Promise<Address[]> => {
  try {
    const address = await AddressRepository.getByProfileId(db, profileId);
    return address;
  } catch (error) {
    throw handleDbError("Failed to get addresses", error);
  }
};
