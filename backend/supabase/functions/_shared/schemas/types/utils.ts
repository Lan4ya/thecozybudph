import { z, ZodType } from "zod";

export type Expand<T> = {
  [K in keyof T]: T[K];
} & {};

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Types we should NOT recursively transform.
 * Add more here if needed (RegExp, Map, Set, etc.)
 */
type Builtin = Date | JSON;

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

/**
 * Types we should NOT recursively transform.
 * Add more here if needed (RegExp, Map, Set, etc.)
 */

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
