import { client, unwrapData } from "./_client";
import type {
  LoginData,
  LoginInput,
  PasswordResetInput,
  ResendEmailVerificationInput,
  SignupData,
  SignupInput,
} from "@cozybud/schemas";

export const AuthAPI = {
  requestResetPassword: async (input: PasswordResetInput) => {
    const res = await client.auth.POST("/auth/password-reset", {
      body: input,
    });
    return unwrapData(res.data, "requestPasswordReset");
  },

  resendEmailVerification: async (input: ResendEmailVerificationInput) => {
    const res = await client.auth.POST("/auth/resend-verification", {
      body: input,
    });
    return unwrapData(res.data, "POST /auth/resend-verification");
  },

  signup: async (payload: SignupInput): Promise<SignupData> => {
    const res = await client.auth.POST("/auth/signup", {
      body: payload,
    });
    return unwrapData(res.data, "POST /auth/signup");
  },

  login: async (payload: LoginInput): Promise<LoginData> => {
    const res = await client.auth.POST("/auth/login", {
      body: payload,
    });
    return unwrapData(res.data, "POST /auth/login");
  },
};
