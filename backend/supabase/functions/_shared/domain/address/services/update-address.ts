import { AddressRepository } from "../address-repository.ts";
import { Address, UpdateAddressInput } from "@shared/types/index.ts";
import { camelToSnake, snakeToCamel } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const updateAddress = async (
  supabase: SupabaseType,
  id: string,
  payload: UpdateAddressInput,
): Promise<Address> => {
  const addressDBInput = camelToSnake({
    ...payload,
  });

  const { data: address, error } = await AddressRepository.updateAddress(
    supabase,
    id,
    addressDBInput,
  );

  if (error)
    throw AppError.internal(`Failed to update address: ${error.message}`);

  if (!address) {
    throw AppError.internal(
      "Invariant Violation: address update returned null data",
    );
  }

  return snakeToCamel(address);
};
