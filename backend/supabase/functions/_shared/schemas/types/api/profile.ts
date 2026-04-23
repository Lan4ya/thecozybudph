import z from "zod";
import { updateProfileSchema } from "../../zod/index.ts";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
