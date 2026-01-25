import { AddressRepository } from "../address-repository.ts";
import { CreateAddressRequest } from "@shared/core/index.ts";
import { camelToSnake } from "@shared/utils/caseConverter.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const createAddress = async (
  supabase: SupabaseType,
  payload: CreateAddressRequest,
  profileId: string,
) => {
  const address = camelToSnake({ ...payload });

  const { data, error } = await AddressRepository.createAddress(
    supabase,
    address,
  );

  if (error)
    throw AppError.internal(`Failed to create address: ${error.message}`);

  // TODO: put this on a separate profile module later
  if (data?.id) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ address_id: data.id })
      .eq("id", profileId);

    if (updateError) {
      throw AppError.internal(
        `Failed to update profile with address: ${updateError.message}`,
      );
    }
  } else {
    throw AppError.internal(`Failed to create address`);
  }

  return data;
};
