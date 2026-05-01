import type { SnakeToCamel } from "@TheCozyBud/schemas";

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
