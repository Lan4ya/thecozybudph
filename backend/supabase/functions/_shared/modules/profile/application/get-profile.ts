import { AppError } from "@shared/errors/Errors.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { ProfileRepository } from "../profile-repository.ts";

export const getProfile = async (db: DrizzleClient, profileId: string) => {
  const profile = await ProfileRepository.getProfileById(db, profileId);

  if (!profile) {
    throw AppError.notFound(`Profile with id ${profileId} not found`);
  }

  return profile;
};
