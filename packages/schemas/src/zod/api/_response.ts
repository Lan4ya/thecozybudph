import { z } from "zod";

export const apiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const apiErrorResponseSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
});
