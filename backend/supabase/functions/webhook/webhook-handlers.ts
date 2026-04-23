import { handleCheckoutWebhook } from "@shared/domain/paymongo/services/handle-checkout-webhook.ts";
import { AppEnv } from "@shared/types.d.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const checkoutPaymongoWebhookHandler = createHandlers(async (c) => {
  const signatureHeader = c.req.header("Paymongo-Signature");
  const rawRequestBody = await c.req.text();
  const res = await handleCheckoutWebhook(rawRequestBody, signatureHeader);
  return handleSuccess(res);
});
