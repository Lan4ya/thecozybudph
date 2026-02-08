import { AddressRepository } from "../address-repository.ts";
import { Address, CreateAddressInput } from "@shared/types/index.ts";
import { camelToSnake, snakeToCamel } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const createAddress = async (
  supabase: SupabaseType,
  payload: CreateAddressInput,
  profileId: string,
): Promise<Address> => {
  const addressDBInput = camelToSnake({ ...payload, profileId });

  const { data: address, error } = await AddressRepository.insertAddress(
    supabase,
    addressDBInput,
  );

  if (error)
    throw AppError.internal(`Failed to create address: ${error.message}`);

  if (!address) {
    throw AppError.internal(
      "Invariant Violation: insertAddress returned null data",
    );
  }

  return snakeToCamel(address);
};
