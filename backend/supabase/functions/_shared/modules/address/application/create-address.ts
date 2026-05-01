import { Address, CreateAddressInput } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const createAddress = async (
  db: DrizzleClient,
  payload: CreateAddressInput,
  profileId: string,
): Promise<Address> => {
  console.log({ profileId });

  const address = await AddressRepository.insert(db, {
    profileId,
    ...payload,
  });
  return address;
};
