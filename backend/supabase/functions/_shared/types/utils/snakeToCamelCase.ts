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
