import { AddressRepository } from "../address-repository.ts";
import { UpdateAddressInput } from "@shared/types/index.ts";
import { camelToSnake } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const updateAddress = async (
  supabase: SupabaseType,
  id: string,
  payload: UpdateAddressInput,
) => {
  const address = camelToSnake({
    ...payload,
  });

  const { data, error } = await AddressRepository.updateAddress(
    supabase,
    id,
    address,
  );

  if (error)
    throw AppError.internal(`Failed to update address: ${error.message}`);

  if (!data) {
    throw AppError.internal(
      "Invariant Violation: address update returned null data",
    );
  }

  return data;
};
