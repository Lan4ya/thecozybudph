import { and, eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { profiles, UpdateProfileDBInput } from "@shared/schemas/index.ts";

export const ProfileRepository = {
  updateProfile: (
    db: DrizzleClient,
    updates: UpdateProfileDBInput,
    profileId: string,
  ) => {
    return db.rls(async (tx) => {
      const updated = await tx
        .update(profiles)
        .set(updates)
        .where(eq(profiles.id, profileId))
        .returning();

      return updated.length ? updated[0] : null;
    });
  },

  getProfileById: (db: DrizzleClient, id: string) => {
    return db.rls(async (tx) => {
      return await tx.query.profiles.findFirst({
        where: and(eq(profiles.id, id)),
      });
    });
  },

  getProfileByEmail: (db: DrizzleClient, email: string) => {
    return db.rls(async (tx) => {
      return await tx.query.profiles.findFirst({
        where: and(eq(profiles.email, email)),
      });
    });
  },
};
