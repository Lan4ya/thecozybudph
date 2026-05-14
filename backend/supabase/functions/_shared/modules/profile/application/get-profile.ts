import { AppError } from "@shared/errors/Errors.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import { snakeToCamelKeys } from "../../../utils/mod.ts";
import { ProfileRepository } from "../profile-repository.ts";

export const getProfile = async (
  supabase: SupabaseDB,
  profileId: string,
): Promise<Profile> => {
  const { data: profile, error: getProfileErr } =
    await ProfileRepository.getProfileById(supabase, profileId);

  if (getProfileErr) {
    throw AppError.internal(getProfileErr.message);
  }

  if (!profile) {
    throw AppError.notFound(`Profile with id ${profileId} not found`);
  }

  return snakeToCamelKeys(profile);
};
