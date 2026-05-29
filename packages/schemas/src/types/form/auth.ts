import z from "zod";
import type {
  logInFormSchema,
  signUpFormSchema,
  forgotPasswordFormSchema,
  resetPasswordSchema,
} from "../../zod/index.ts";

export type SignUp = z.infer<typeof signUpFormSchema>;
export type LogIn = z.infer<typeof logInFormSchema>;
export type ForgotPassword = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
