import z from "zod";
import { updateProfileSchema } from "../../zod/api/index.ts";

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
