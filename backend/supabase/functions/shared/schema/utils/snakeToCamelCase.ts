export type SnakeToCamelCase<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
    : S;

export type SnakeToCamel<T> =
  T extends Array<infer U>
    ? Array<SnakeToCamel<U>>
    : T extends object
      ? {
          [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamel<T[K]>;
        }
      : T;
