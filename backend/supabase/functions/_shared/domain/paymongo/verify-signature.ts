const PAYMONGO_CHECKOUT_WEBHOOK_SECRET = Deno.env.get(
  "PAYMONGO_CHECKOUT_WEBHOOK_SECRET",
)!;

export async function verifySignature(
  signatureHeader: string,
  rawBody: string,
): Promise<boolean> {
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

  const computed = await hmacSha256(PAYMONGO_CHECKOUT_WEBHOOK_SECRET, payload);

  return timingSafeEqual(computed, signature);
}

async function hmacSha256(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
