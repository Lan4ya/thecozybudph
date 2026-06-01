import { actionCooldowns, CooldownType } from "@shared/schemas/index.ts";
import { and, eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { InferInsertModel } from "drizzle-orm";

export type NewDBActionCooldown = InferInsertModel<typeof actionCooldowns>;

export const AuthRepository = {
  getCooldown: (
    db: DrizzleClient,
    profileId: string,
    actionType: CooldownType,
  ) => {
    return db.rls(async (tx) => {
      return await tx.query.actionCooldowns.findFirst({
        where: and(
          eq(actionCooldowns.profileId, profileId),
          eq(actionCooldowns.actionType, actionType),
        ),
      });
    });
  },

  upsertCooldown: (db: DrizzleClient, cooldown: NewDBActionCooldown) => {
    return db.admin.transaction(async (tx) => {
      const [row] = await tx
        .insert(actionCooldowns)
        .values(cooldown)
        .onConflictDoUpdate({
          target: [actionCooldowns.profileId, actionCooldowns.actionType],
          set: {
            endsAt: cooldown.endsAt,
            createdAt: cooldown.createdAt,
          },
        });
      return row;
    });
  },
};
