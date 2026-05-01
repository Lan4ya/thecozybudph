import { Address, UpdateAddress } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";

export const updateAddress = async (
  db: DrizzleClient,
  id: string,
  payload: UpdateAddress,
): Promise<Address> => {
  return await AddressRepository.update(db, id, payload);
};
