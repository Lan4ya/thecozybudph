import type { SignupData, SignupInput } from "@shared/schemas/index.ts";
import { SupabaseDB } from "@shared/types.d.ts";
import { verifyTurnstileToken } from "@shared/utils/verifyTurnstile.ts";

export const signup = async (
  supabase: SupabaseDB,
  clientIp: string | undefined,
  appUrl: string,
  payload: SignupInput,
): Promise<SignupData> => {
  const { email, password, cfTurnstileToken } = payload;

  await verifyTurnstileToken(cfTurnstileToken, clientIp);

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: appUrl,
    },
  });

  if (error || !user) {
    throw error;
  }

  /* 
   If in supabase config email and phone confirmations are both
   enabled (which they are) supabase will return '{success: boolean, user:
   User}' regardless if the the email is already in use to prevent user
   enumeration attacks.

   You can test this by signing up an account that's already been registered, run:

  curl -X POST http://127.0.0.1:54321/functions/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@local.dev",
      "password": "password123",
      "cfTurnstileToken": "XXXX.DUMMY.TOKEN.XXXX"
    }' | jq '.'

   The response should look exactly like a successful signup, the difference is that
   if the field 'identities' inside the user object contains an empty array like so:
   "identities": []

   That's supabase's obfuscated way to say that the user is already registered.
   In a truly successful signup attempt, identities will always have values. We can
   still show a proper message (for UX) in the signup form using this condition on
   the client directly:

   if (user?.identities?.length === 0) {
     setFormError("email already in use");
   }

  docs: https://supabase.com/docs/reference/javascript/auth-signup
  */

  return { success: true, user: user as unknown as SignupData["user"] };
};
