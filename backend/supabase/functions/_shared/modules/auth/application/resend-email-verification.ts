import { stabilizeTiming } from "@shared/utils/stabilizeTiming.ts";
import { SupabaseClient } from "supabase";
import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { ProfileRepository } from "../../profile/profile-repository.ts";
import { AuthRepository } from "../auth-repository.ts";

export const resendEmailVerification = async (
  db: DrizzleClient,
  supabase: SupabaseClient,
  email: string,
): Promise<{ success: boolean }> => {
  const startTime = performance.now();

  const profile = await ProfileRepository.getProfileByEmail(db, email);

  if (profile) {
    const cooldown = await AuthRepository.getCooldown(
      db,
      profile.id,
      "email_verification",
    );

    if (cooldown) {
      const endsAt = new Date(cooldown.endsAt);
      if (endsAt > new Date()) {
        throw AppError.badRequest({
          message:
            "Too many request, please wait a moment before requesting another verification email",
        });
      }
    }

    // Trigger Supabase Resend
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: Deno.env.get("APP_URL") },
    });

    if (error) throw error;

    await AuthRepository.upsertCooldown(db, {
      profileId: profile.id,
      actionType: "email_verification",
      endsAt: new Date(Date.now() + 120 * 1000),
    });
  }

  await stabilizeTiming(startTime, 2500);

  return { success: true };
};
