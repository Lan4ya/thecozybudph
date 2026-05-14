const env = (() => {
  try {
    return Deno.env.get("ENV") ?? "production";
  } catch (error) {
    if (error instanceof Deno.errors.NotCapable) {
      return "production";
    }
    throw error;
  }
})();

export const isDev: boolean = env === "development";
