type Primitive = string | number | boolean | bigint | symbol | null | undefined;

/**
 * Types we should NOT recursively transform.
 * Add more here if needed (RegExp, Map, Set, etc.)
 */
type Builtin = Date;

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
