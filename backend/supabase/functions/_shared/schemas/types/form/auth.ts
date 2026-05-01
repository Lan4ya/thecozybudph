import z from "zod";
import { signUpFormSchema, logInFormSchema } from "../../zod/index.ts";

export type SignUp = z.infer<typeof signUpFormSchema>;
export type LogIn = z.infer<typeof logInFormSchema>;
