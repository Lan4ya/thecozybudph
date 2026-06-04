import { DrizzleClient } from "../../../db/client.ts";
import { AddressData } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getDefaultAddress = async (
  db: DrizzleClient,
  profileId: string,
): Promise<AddressData | null> => {
  return (await AddressRepository.getDefault(db, profileId)) ?? null;
};
