import z from "zod";
import type { logInFormSchema, signUpFormSchema } from "../../zod/index.ts";

export type SignUp = z.infer<typeof signUpFormSchema>;
export type LogIn = z.infer<typeof logInFormSchema>;
