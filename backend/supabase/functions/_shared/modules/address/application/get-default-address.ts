import { DrizzleClient } from "../../../db/client.ts";
import { Address } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";

export const getDefaultAddress = async (
  db: DrizzleClient,
  profileId: string,
): Promise<Address | null> => {
  return (await AddressRepository.getDefault(db, profileId)) ?? null;
};
