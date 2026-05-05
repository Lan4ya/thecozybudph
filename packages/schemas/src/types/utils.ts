import { z, ZodType } from "zod";

export type Expand<T> = {
  [K in keyof T]: T[K];
} & {};

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Builtin = Date | JSON; // etc.

/* ---------------------------------- */
/*         Snake → Camel Case         */
/* ---------------------------------- */

export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

export type SnakeToCamel<T> = T extends Primitive
  ? T
  : T extends Builtin
    ? T
    : T extends ReadonlyArray<infer U>
      ? SnakeToCamel<U>[]
      : T extends object
        ? {
            [K in keyof T as K extends string
              ? SnakeToCamelCase<K>
              : K]: SnakeToCamel<T[K]>;
          }
        : T;

/* ---------------------------------- */
/*         Camel → Snake Case         */
/* ---------------------------------- */

export type CamelToSnakeCase<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Lowercase<First>
      ? `${First}${CamelToSnakeCase<Rest>}`
      : `_${Lowercase<First>}${CamelToSnakeCase<Rest>}`
    : S;

export type CamelToSnake<T> = T extends Primitive
  ? T
  : T extends Builtin
    ? T
    : T extends ReadonlyArray<infer U>
      ? CamelToSnake<U>[]
      : T extends object
        ? {
            [K in keyof T as K extends string
              ? CamelToSnakeCase<K>
              : K]: CamelToSnake<T[K]>;
          }
        : T;

export function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnakeCaseString(camel: string): string {
  return camel.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export const coerceNumber = <T extends ZodType<any, any>>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      const t = val.trim();
      if (t === "") return undefined;

      const n = Number(t);
      return Number.isNaN(n) ? val : n;
    }
    return val;
  }, schema);

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

/**
 * Creates a Zod schema for validating route params with a dynamic UUID key.
 *
 * Example:
 * uuidParamSchema("id") → { id: string (uuid) }
 * uuidParamSchema("orderId") → { orderId: string (uuid) }
 */ export const uuidParamSchema = (key: string) =>
  z.object({
    [key]: z.uuid(),
  });
