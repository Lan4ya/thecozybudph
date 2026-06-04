import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "@shared/errors/Errors.ts";

const WEBHOOK_SECRET = Deno.env.get("LALAMOVE_SECRET_KEY");

// Lalamove code example (Node version):  https://jsfiddle.net/qecvaxwd/
export function verifySignature(
  rawBody: string,
  authorizationHeader: string,
): boolean {
  if (!WEBHOOK_SECRET) {
    throw AppError.badRequest({ message: "Missing Webhook Secret" });
  }

  if (!rawBody || rawBody.trim() === "") {
    return true;
  }

  const authParts = authorizationHeader.split(" ");
  if (authParts[0] !== "hmac" || !authParts[1]) {
    console.error("Invalid authorization format wrapper");
    return false;
  }

  const credentialParts = authParts[1].split(":");
  if (credentialParts.length !== 3) {
    console.error("Malformed credential elements");
    return false;
  }

  const [, timestampMsStr, inboundSignatureHex] = credentialParts;
  const timestampMs = parseInt(timestampMsStr, 10);

  if (!timestampMs || !inboundSignatureHex) return false;

  const currentTimeMs = Date.now();
  if (Math.abs(currentTimeMs - timestampMs) > 300000) {
    console.error("Timestamp is too old or heavily drifted");
    return false;
  }

  try {
    const parsedRoot = JSON.parse(rawBody);
    if (!parsedRoot.data) {
      console.error("Payload missing inner 'data' wrapper object");
      return false;
    }

    // Stringify only the inner data payload to match Lalamove spec
    const targetBodyStr = JSON.stringify(parsedRoot.data);

    const method = "POST";
    const webhookPath = "/functions/v1/admin/shipment/webhook";
    const payload = `${timestampMs}\r\n${method}\r\n${webhookPath}\r\n\r\n${targetBodyStr}`;

    const computedHex = createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    const computedBuffer = Buffer.from(computedHex, "hex");
    const signatureBuffer = Buffer.from(inboundSignatureHex, "hex");

    if (computedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, signatureBuffer);
  } catch {
    console.error("Failed to parse request string body payload JSON structure");
    return false;
  }
}
