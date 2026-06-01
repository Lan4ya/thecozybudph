import { checkActionCooldown } from "./application/check-action-cooldown.ts";
import { requestPasswordReset } from "./application/request-password-reset.ts";
import { resendEmailVerification } from "./application/resend-email-verification.ts";
import { signup } from "./application/signup.ts";
import { login } from "./application/login.ts";

export const AuthActions = {
  signup,
  login,
  checkActionCooldown,
  requestPasswordReset,
  resendEmailVerification,
};
