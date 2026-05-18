import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "../../errors/Errors.ts";

// Note: If you create a new webhook, make sure to update the webhook secret key in .env
// since the verifySignature will always fail if the app is using the wrong/outdated key.
const WEBHOOK_SECRET = Deno.env.get("PAYMONGO_CHECKOUT_WEBHOOK_SECRET");

// Scroll to number 3 Securing a Webhook:
// https://developers.paymongo.com/docs/creating-webhook
export function verifySignature(
  rawBody: string,
  signatureHeader: string,
): boolean {
  if (!WEBHOOK_SECRET) throw AppError.badRequest("Missing Webhook Secret");

  // signatureHeader format: t=timestamp,te=test_signature,li=live_signature
  const parts = signatureHeader
    .split(",")
    .reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

  // isDev && console.log({ parts });

  const timestampSec = parts.t;
  const signature = parts.te || parts.li; // test or live mode (either will become falsy depending on the key used)

  if (!timestampSec || !signature) return false;

  // Reject if webhook is older than 5 mins
  const currentTimeSec = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTimeSec - parseInt(timestampSec, 10)) > 300) {
    console.error("Timestamp is too old");
    return false;
  }

  // Generate HMAC
  const payload = `${timestampSec}.${rawBody}`;
  const computedHex = createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  // Validation
  const computedBuffer = Buffer.from(computedHex, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  // console.log({ computedHex, signature });

  if (computedBuffer.length !== signatureBuffer.length) {
    // isDev && console.error("Signature length mismatch");
    return false;
  }

  return timingSafeEqual(computedBuffer, signatureBuffer);
}
