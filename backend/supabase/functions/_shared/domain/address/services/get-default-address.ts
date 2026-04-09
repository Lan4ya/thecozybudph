import { DrizzleClient } from "../../../db/client.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { Address } from "../../../types/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getDefaultAddress = async (
  db: DrizzleClient,
  profileId: string,
): Promise<Address | null> => {
  try {
    return (await AddressRepository.getDefault(db, profileId)) ?? null;
  } catch (error) {
    throw handleDbError("Failed to get addresses", error);
  }
};
