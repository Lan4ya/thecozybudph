export type CamelToSnakeCase<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Lowercase<First>
      ? `${First}${CamelToSnakeCase<Rest>}`
      : `_${Lowercase<First>}${CamelToSnakeCase<Rest>}`
    : S;

export type CamelToSnake<T> =
  T extends Array<infer U>
    ? Array<CamelToSnake<U>>
    : T extends object
      ? {
          [K in keyof T as CamelToSnakeCase<K & string>]: CamelToSnake<T[K]>;
        }
      : T;
