import { z, ZodType } from "zod";

export const coerceNumber = <T extends ZodType<any, any>>(schema: T) =>
  z.preprocess(
    (val) =>
      typeof val === "string" && val.trim() === "" ? undefined : Number(val),
    schema,
  );

export const stringToArray = (schema: ZodType = z.string()) =>
  z.preprocess((val) => {
    if (typeof val === "string") return [val];
    if (Array.isArray(val)) return val;
    return [];
  }, z.array(schema));

/**
 * Zod preprocessor that parses a string as JSON into an object.
 * - `'{"a":1}'` → `{a:1}`
 * - object → returned as is
 * - anything else → `{}`
 */
export const stringToObject = <T extends ZodType>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      } catch {}
    }
    if (typeof val === "object" && val !== null) return val;
    return {};
  }, schema);
