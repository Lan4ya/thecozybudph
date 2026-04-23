import z from "zod";
import { signUpFormSchema, logInFormSchema } from "../../zod";

export type SignUp = z.infer<typeof signUpFormSchema>;
export type LogIn = z.infer<typeof logInFormSchema>;
