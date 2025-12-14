const env = Deno.env.get("ENV") ?? "production";
export const isDev: boolean = env === "development";
