import { z } from "zod";

export const signUpFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  cfTurnstileToken: z.string(),
});

export const logInFormSchema = signUpFormSchema;

export const forgotPasswordFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  cfTurnstileToken: z.string(),
});

export const updateUserSchema = signUpFormSchema.partial().extend({
  displayName: z
    .string()
    .min(4, "Display name must be at least 4 characters")
    .optional(),
});

export const resetPasswordFormSchema = signUpFormSchema.omit({
  email: true,
  cfTurnstileToken: true,
});
