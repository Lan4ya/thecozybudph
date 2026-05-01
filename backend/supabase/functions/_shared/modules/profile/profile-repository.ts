import { eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { profiles, UpdateProfileDBInput } from "@shared/schemas/index.ts";

export const ProfileRepository = {
  updateProfile: (
    db: DrizzleClient,
    updates: UpdateProfileDBInput,
    profileId: string,
  ) => {
    return db.rls(async (tx) => {
      const [updated] = await tx
        .update(profiles)
        .set(updates)
        .where(eq(profiles.id, profileId))
        .returning();

      return updated ?? null;
    });
  },

  getProfileById: (db: DrizzleClient, profileId: string) => {
    return db.rls(async (tx) => {
      const [profile] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.id, profileId))
        .limit(1);

      return profile ?? null;
    });
  },
};
