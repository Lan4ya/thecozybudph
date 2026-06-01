import { DrizzleClient } from "../../../db/client.ts";
import { AuthRepository } from "../auth-repository.ts";
import { ProfileRepository } from "../../profile/profile-repository.ts";
import { CooldownData, CheckCooldownInput } from "@shared/schemas/index.ts";
import { stabilizeTiming } from "@shared/utils/stabilizeTiming.ts";

export const checkActionCooldown = async (
  db: DrizzleClient,
  profileId: string | undefined,
  input: CheckCooldownInput,
): Promise<CooldownData> => {
  const { actionType, email } = input;
  let targetProfileId = profileId;

  const startTime = performance.now();

  if (!targetProfileId && email) {
    const profile = await ProfileRepository.getProfileByEmail(db, email);
    targetProfileId = profile?.id;
  }

  const cooldown = targetProfileId
    ? await AuthRepository.getCooldown(db, targetProfileId, actionType)
    : null;

  // Response-Time Normalization:
  // We pad the execution time here so that fake emails (which skip queries)
  // take just as long as real emails.

  // Scenario 1 (Fake Email): Takes 5ms -> padded by 55ms -> returns in exactly 60ms to hide account absence.
  // Scenario 2 (Real Email): Takes 42ms -> padded by 18ms -> returns in exactly 60ms to hide account existence.
  // Scenario 3 (Real Email with DB Latency): Takes 71ms -> exceeds 60ms target -> bypasses padding and returns immediately.
  await stabilizeTiming(startTime, 60);

  if (!targetProfileId || !cooldown) {
    return {
      actionType,
      endsAt: null,
    };
  }

  const endsAt = new Date(cooldown.endsAt);

  return {
    actionType,
    endsAt,
  };
};
