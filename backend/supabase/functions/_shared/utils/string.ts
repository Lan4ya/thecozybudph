import { SnakeToCamel, CamelToSnake } from "@shared/schemas/index.ts";
import { isDev } from "@shared/utils/isDev.ts";

export const formatPrice = (price = 0) => {
  const hasCentavos = !Number.isInteger(price);

  return price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: hasCentavos ? 2 : 0,
    maximumFractionDigits: hasCentavos ? 2 : 0,
  });
};

export const formatSupabasePublicUrl = (url: string) => {
  if (!url) return url;

  return isDev
    ? // replace supabase's internal docker host + port with localhost mapped port so the browser can access it
      url.replace("kong:8000", "127.0.0.1:54321")
    : url;
};

export function snakeToCamelKeys<T>(obj: T): SnakeToCamel<T> {
  if (obj == null) return obj as SnakeToCamel<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamelKeys(item)) as SnakeToCamel<T>;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      newObj[camelKey] = snakeToCamelKeys(value);
    }
    return newObj as SnakeToCamel<T>;
  }

  return obj as SnakeToCamel<T>;
}

export function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnakeCaseString(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function camelToSnakeKeys<T>(obj: T): CamelToSnake<T> {
  if (obj == null) return obj as CamelToSnake<T>;

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnakeKeys(item)) as CamelToSnake<T>;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const newObj: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      newObj[snakeKey] = camelToSnakeKeys(value);
    }

    return newObj as CamelToSnake<T>;
  }

  return obj as CamelToSnake<T>;
}
