import { z } from "@hono/zod-openapi";
import { apiSuccessResponseSchema } from "./_response.ts";
import { forgotPasswordFormSchema, signUpFormSchema } from "../form/auth.ts";

export const signupSchema = signUpFormSchema;
export const loginSchema = signUpFormSchema;

export const passwordResetSchema = forgotPasswordFormSchema;

export const resendEmailVerificationSchema = z.object({
  email: z.email("invalid email"),
});

export const cooldownTypeSchema = z.enum([
  "otp_sms",
  "email_verification",
  "password_reset",
]);

export const checkCooldownSchema = z.object({
  actionType: cooldownTypeSchema,
  email: z.email("invalid email").optional(),
});

// DATA

export const cooldownDataSchema = z.object({
  actionType: cooldownTypeSchema,
  endsAt: z.date().nullable(),
});

export const supabaseUserSchema = z
  .object({
    id: z.uuid(),
    app_metadata: z.record(z.string(), z.unknown()),
    user_metadata: z.record(z.string(), z.unknown()),
    aud: z.string(),
    confirmation_sent_at: z.string().optional(),
    recovery_sent_at: z.string().optional(),
    email_change_sent_at: z.string().optional(),
    new_email: z.email().optional(),
    new_phone: z.string().optional(),
    invited_at: z.string().optional(),
    action_link: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    created_at: z.string(),
    confirmed_at: z.string().optional(),
    email_confirmed_at: z.string().optional(),
    phone_confirmed_at: z.string().optional(),
    last_sign_in_at: z.string().optional(),
    role: z.string().optional(),
    updated_at: z.string().optional(),
    identities: z.array(z.record(z.string(), z.unknown())).optional(),
    is_anonymous: z.boolean().optional(),
    is_sso_user: z.boolean().optional(),
    factors: z.array(z.record(z.string(), z.unknown())).optional(),
    deleted_at: z.string().optional(),
    banned_until: z.string().optional(),
  })
  .openapi("User");

export const signupDataSchema = z.object({
  success: z.boolean(),
  user: supabaseUserSchema,
});

export const loginDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// RESPONSE

export const signupResponseSchema = apiSuccessResponseSchema(signupDataSchema);

export const loginResponseSchema = apiSuccessResponseSchema(loginDataSchema);

export const cooldownResponseSchema =
  apiSuccessResponseSchema(cooldownDataSchema);

export const resendEmailVerificationResponseSchema = apiSuccessResponseSchema(
  z.object({ success: z.boolean() }),
);

export const passwordResetResponseSchema =
  resendEmailVerificationResponseSchema;
