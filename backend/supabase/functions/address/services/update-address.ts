import { AddressRepository } from "../address-repository.ts";
import { UpdateAddressRequest } from "@shared/core/index.ts";
import { camelToSnake } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const updateAddress = async (
  supabase: SupabaseType,
  id: string,
  payload: UpdateAddressRequest,
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
    throw AppError.notFound("Address not found or not accessible");
  }

  return data;
};
