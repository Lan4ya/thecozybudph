import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import { snakeToCamelKeys } from "@shared/utils/mod.ts";
import { ProfileRepository } from "../profile-repository.ts";

export const updateProfile = async (
  supabase: SupabaseDB,
  payload: UpdateProfileInput,
  profileId: string,
): Promise<Profile> => {
  console.log({ payload });

  const { data: updatedProfile, error: updateProfileErr } =
    await ProfileRepository.updateProfile(supabase, payload, profileId);

  if (updateProfileErr) {
    throw AppError.internal(updateProfileErr.message);
  }

  if (!updatedProfile) {
    throw AppError.notFound(`Profile with id ${profileId} not found`);
  }

  return snakeToCamelKeys(updatedProfile);
};
