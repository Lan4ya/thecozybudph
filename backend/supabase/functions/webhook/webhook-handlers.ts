import { PaymentActions } from "@shared/modules/payment/mod.ts";
import { AppEnv } from "@shared/types.d.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const checkoutPaymongoWebhookHandler = createHandlers(async (c) => {
  const signatureHeader = c.req.header("Paymongo-Signature");
  const rawBody = await c.req.text();
  const res = await PaymentActions.handlePaymentWebhook(
    rawBody,
    signatureHeader,
  );
  return handleSuccess(res);
});
