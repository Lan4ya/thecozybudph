import { z, ZodType } from "zod";

export const coerceNumber = <T extends ZodType<any, any>>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") return Number(val);
    return val;
  }, schema);
