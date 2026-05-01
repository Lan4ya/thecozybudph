import { DrizzleClient } from "../../../db/client.ts";
import { Address } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getAddresses = async (
  db: DrizzleClient,
  profileId: string,
): Promise<Address[]> => {
  return await AddressRepository.getByProfileId(db, profileId);
};
