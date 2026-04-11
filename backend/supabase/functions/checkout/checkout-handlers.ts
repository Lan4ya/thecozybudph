import { OrderService } from "@shared/domain/order/mod.ts";
import { PaymentService } from "@shared/domain/payment/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  createOrderSchema,
  createPaymentSchema,
  createShippingQuoteSchema,
} from "@shared/package-types/index.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createShippingQuoteHandler = createHandlers(
  zodValidatorMiddleware("json", createShippingQuoteSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const res = await OrderService.createShippingQuotation(payload);
    return handleSuccess(res);
  },
);

export const createOrderHandler = createHandlers(
  zodValidatorMiddleware("json", createOrderSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await OrderService.createOrder(db, profileId, payload);
    return handleSuccess(res);
  },
);

export const createPaymentHandler = createHandlers(
  zodValidatorMiddleware("json", createPaymentSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");
    const res = await PaymentService.createPayment(
      db,
      payload,
      profileId,
      idempotencyKey,
    );
    return handleSuccess(res);
  },
);

export const paymentWebhookHandler = createHandlers(async (c) => {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header("Paymongo-Signature");
  const res = await PaymentService.handlePaymentWebhook(
    rawBody,
    signatureHeader,
  );
  return handleSuccess(res);
});
