import type z from "zod";
import {
  type checkCooldownSchema,
  type cooldownDataSchema,
  type cooldownTypeSchema,
  type passwordResetSchema,
  type resendEmailVerificationSchema,
  signupSchema,
  loginSchema,
  signupDataSchema,
  loginDataSchema,
} from "../../zod/index.ts";

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckCooldownInput = z.infer<typeof checkCooldownSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ResendEmailVerificationInput = z.infer<
  typeof resendEmailVerificationSchema
>;

export type CooldownType = z.infer<typeof cooldownTypeSchema>;
export type CooldownData = z.infer<typeof cooldownDataSchema>;
export type SignupData = z.infer<typeof signupDataSchema>;
export type LoginData = z.infer<typeof loginDataSchema>;
