import { AppError } from "@shared/errors/Errors.ts";
import { isDev } from "@shared/utils/isDev.ts";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

// Official Cloudflare Testing Token
const TURNSTILE_DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const TURNSTILE_DUMMY_SECRET = "1x0000000000000000000000000000000AA";

/**
 * Validates the token against the Cloudflare Turnstile API endpoint.
 * Throws an error on failure.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<void> {
  const secretKey = Deno.env.get("CF_TURNSTILE_SECRET_KEY");

  if (!secretKey) {
    throw new Error(
      "TURNSTILE_SECRET_KEY environmental variable is missing on host server.",
    );
  }

  const formData = new FormData();
  if (isDev) {
    formData.append("response", TURNSTILE_DUMMY_TOKEN);
    formData.append("secret", TURNSTILE_DUMMY_SECRET);
  } else {
    formData.append("secret", secretKey);
    formData.append("response", token);
  }
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    const outcome: TurnstileResponse = await response.json();

    if (!outcome.success) {
      const errorDetails =
        outcome["error-codes"]?.join(", ") ?? "Unknown verification error";
      throw AppError.unauthorized({
        message: `Security challenge failed: ${errorDetails}`,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network/Verification error";
    throw new Error(`Turnstile validation down: ${message}`);
  }
}
