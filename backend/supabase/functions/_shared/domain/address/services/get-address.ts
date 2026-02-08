import { SupabaseType } from "@shared/types.d.ts";
import { AddressRepository } from "../address-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getAddress = async (supabase: SupabaseType, profileId: string) => {
  const { data, error } = await AddressRepository.getAddressByProfileId(
    supabase,
    profileId,
  );

  if (error) throw AppError.internal(`Failed to get address: ${error.message}`);

  if (!data) {
    throw AppError.notFound("Address not found or not accessible");
  }

  return data;
};
