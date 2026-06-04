import { DrizzleClient } from "../../../db/client.ts";
import { AddressData } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getAddresses = async (
  db: DrizzleClient,
  profileId: string,
): Promise<AddressData[]> => {
  return await AddressRepository.getByProfileId(db, profileId);
};
