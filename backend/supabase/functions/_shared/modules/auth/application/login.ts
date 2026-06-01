import type { LoginData, LoginInput } from "@shared/schemas/index.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import { verifyTurnstileToken } from "@shared/utils/verifyTurnstile.ts";

export const login = async (
  supabase: SupabaseDB,
  clientIp: string | undefined,
  payload: LoginInput,
): Promise<LoginData> => {
  const { email, password, cfTurnstileToken } = payload;

  await verifyTurnstileToken(cfTurnstileToken, clientIp);

  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !session) {
    throw error;
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
};
