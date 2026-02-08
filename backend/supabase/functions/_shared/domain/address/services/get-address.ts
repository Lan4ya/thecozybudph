import { SupabaseType } from "@shared/types.d.ts";
import { AddressRepository } from "../address-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { Address } from "../../../types/index.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";

export const getAddress = async (
  supabase: SupabaseType,
  profileId: string,
): Promise<Address> => {
  const { data, error } = await AddressRepository.getAddressByProfileId(
    supabase,
    profileId,
  );

  const address = data?.addresses?.[0];

  if (error) throw AppError.internal(`Failed to get address: ${error.message}`);

  if (!address) {
    throw AppError.notFound("Address not found or not accessible");
  }

  return snakeToCamel(address);
};
