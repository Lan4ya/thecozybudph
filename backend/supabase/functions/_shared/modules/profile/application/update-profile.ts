import { AppError } from "@shared/errors/Errors.ts";
import { UpdateProfileInput } from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { ProfileRepository } from "../profile-repository.ts";

export const updateProfile = async (
  db: DrizzleClient,
  payload: UpdateProfileInput,
  profileId: string,
) => {
  const updatedProfile = await ProfileRepository.updateProfile(
    db,
    payload,
    profileId,
  );

  if (!updatedProfile) {
    throw AppError.notFound(`Profile with id ${profileId} not found`);
  }

  return updatedProfile;
};
