import { DrizzleClient } from "../../../db/client.ts";
import { AuthRepository } from "../auth-repository.ts";
import { ProfileRepository } from "../../profile/profile-repository.ts";
import { AppError } from "../../../errors/Errors.ts";
import { SupabaseClient } from "supabase";
import { stabilizeTiming } from "@shared/utils/stabilizeTiming.ts";
import { verifyTurnstileToken } from "@shared/utils/verifyTurnstile.ts";

export const requestPasswordReset = async (
  db: DrizzleClient,
  supabase: SupabaseClient,
  email: string,
  cfTurnstileToken: string,
  clientIp: string | undefined,
): Promise<{ success: boolean }> => {
  // track execution
  const startTime = performance.now();

  await verifyTurnstileToken(cfTurnstileToken, clientIp);

  const profile = await ProfileRepository.getProfileByEmail(db, email);

  if (profile) {
    // Check cooldown first
    const cooldown = await AuthRepository.getCooldown(
      db,
      profile.id,
      "password_reset",
    );

    if (cooldown && new Date(cooldown.endsAt) > new Date()) {
      // Thrown errors bypass downstream stabilizing code,
      // but that is acceptable here because a rate-limiter block on the route
      // handles abusing users.
      throw AppError.rateLimit();
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        Deno.env.get("APP_URL") + "/auth/forgot-password/reset-password",
    });

    if (error) throw error;

    await AuthRepository.upsertCooldown(db, {
      profileId: profile.id,
      actionType: "password_reset",
      endsAt: new Date(Date.now() + 120 * 1000), // 2 minutes
    });
  }

  // Stabilizer:
  // Since Supabase auth and SMTP email dispatch is network-heavy
  // We can pad the response floor up to 2.5 seconds.
  await stabilizeTiming(startTime, 2500);

  // Prevent user enumeration:
  // Return identical payload whether profile existed or not
  return { success: true };
};
