import { AddressRepository } from "../address-repository.ts";
import { CreateAddressInput } from "@shared/types/index.ts";
import { camelToSnake } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const createAddress = async (
  supabase: SupabaseType,
  payload: CreateAddressInput,
  profileId: string,
) => {
  const address = camelToSnake({ ...payload, profileId });

  const { data, error } = await AddressRepository.insertAddress(
    supabase,
    address,
  );

  if (error)
    throw AppError.internal(`Failed to create address: ${error.message}`);

  if (!data) {
    throw AppError.internal(
      "Invariant Violation: address insert returned null data",
    );
  }

  return data;
};
