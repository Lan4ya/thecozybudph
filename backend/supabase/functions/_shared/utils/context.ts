import { Context } from "hono";
import { env } from "hono/adapter";
import { AppError } from "../errors/Errors.ts";
import { Bindings, Variables } from "../types.d.ts";

export function requireVariables<T extends keyof Variables>(
  c: Context,
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

    const cause = `Missing required context ${isPlural ? `variables` : `variable`}: ${missing.join(", ")}`;

    throw AppError.internal({ message: "Internal server error", cause });
  }

  return result;
}

export function requireBindings<T extends keyof Bindings>(
  c: Context,
  ...keys: T[]
): Required<Pick<Bindings, T>> {
  const result = {} as Required<Pick<Bindings, T>>;
  const missing: string[] = [];

  const platformEnv = env(c);

  for (const key of keys) {
    const value = platformEnv[key];

    if (value === undefined) {
      missing.push(String(key));
    } else {
      result[key] = value as Required<Pick<Bindings, T>>[T];
    }
  }

  if (missing.length) {
    const isPlural = missing.length > 1;

    const cause = `Missing required env ${isPlural ? "variables" : "variable"}: ${missing.join(", ")}`;

    throw AppError.internal({ message: "Internal server error", cause });
  }

  return result;
}
