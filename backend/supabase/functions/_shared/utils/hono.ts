import { createFactory } from "hono/factory";
import { AppEnv, Variables } from "../types.d.ts";
import { Context } from "hono";
import { AppError } from "../errors/Errors.ts";

const factory = createFactory<AppEnv>();
export const { createHandlers, createMiddleware } = factory;

// Type guard to ensure required variables are set
export function requireVariables<T extends keyof Variables>(
  c: Context<AppEnv>,
  ...keys: T[]
): Required<Pick<Variables, T>> {
  const result = {} as Required<Pick<Variables, T>>;
  const missing: string[] = [];

  for (const key of keys) {
    const value = c.get(key);
    if (value === undefined) {
      missing.push(key);
    } else {
      result[key] = value as Required<Pick<Variables, T>>[T];
    }
  }

  if (missing.length) {
    const isPlural = missing.length > 1;
    throw AppError.internal(
      `Missing required context ${isPlural ? `variables` : `variable`}: ${missing.join(", ")}`,
    );
  }

  return result;
}
