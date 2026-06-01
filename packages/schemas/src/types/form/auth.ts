import z from "zod";
import type {
  logInFormSchema,
  signUpFormSchema,
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
} from "../../zod/index.ts";

export type SignUpFormData = z.infer<typeof signUpFormSchema>;
export type LogInFormData = z.infer<typeof logInFormSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPassword = z.infer<typeof resetPasswordFormSchema>;
