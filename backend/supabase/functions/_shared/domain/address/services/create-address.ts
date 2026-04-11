import { Address, CreateAddressInput } from "@shared/package-types/index.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const createAddress = async (
  db: DrizzleClient,
  payload: CreateAddressInput,
  profileId: string,
): Promise<Address> => {
  console.log({ profileId });

  try {
    const address = await AddressRepository.insert(db, {
      profileId,
      ...payload,
    });
    return address;
  } catch (error) {
    throw handleDbError("Failed to create address", error);
  }
};
