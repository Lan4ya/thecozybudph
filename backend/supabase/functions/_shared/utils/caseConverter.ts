import { SnakeToCamel } from "../types/utils/snakeToCamelCase.ts";
import { CamelToSnake } from "../types/utils/camelToSnakeCase.ts";

export function snakeToCamel<T>(obj: T): SnakeToCamel<T> {
  if (obj == null) return obj as SnakeToCamel<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as SnakeToCamel<T>;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      newObj[camelKey] = snakeToCamel(value);
    }
    return newObj as SnakeToCamel<T>;
  }

  return obj as SnakeToCamel<T>;
}

export function camelToSnake<T>(obj: T): CamelToSnake<T> {
  if (obj == null) return obj as CamelToSnake<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item)) as CamelToSnake<T>;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const newObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      newObj[snakeKey] = camelToSnake(value);
    }

    return newObj as CamelToSnake<T>;
  }

  return obj as CamelToSnake<T>;
}
