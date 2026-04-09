import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

const PAYMONGO_CHECKOUT_WEBHOOK_SECRET = Deno.env.get(
  "PAYMONGO_CHECKOUT_WEBHOOK_SECRET",
)!;

export function verifySignature(
  signatureHeader: string,
  rawBody: string,
): boolean {
  // On how this works, scroll to number 3. 'Securing a Webhook':
  // https://developers.paymongo.com/docs/creating-webhook
  const parts = signatureHeader
    .split(",")
    .reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

  const timestampSec = parts?.t;
  const signature = parts?.li ?? parts?.te; // live or test

  if (!timestampSec || !signature) return false;

  const currentTimeSec = Math.floor(Date.now() / 1000);

  // Reject if the webhook is older than 5 minutes
  if (Math.abs(currentTimeSec - parseInt(timestampSec, 10)) > 300) {
    console.warn("Webhook timestamp is too old or in the future.");
    return false;
  }

  const payload = `${timestampSec}.${rawBody}`;

  const computed = createHmac("sha256", PAYMONGO_CHECKOUT_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(signature, "hex"),
  );
}
