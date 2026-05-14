import { OrderActions } from "@shared/modules/order/mod.ts";
import { PaymentActions } from "@shared/modules/payment/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import {
  createOrderSchema,
  payOrderSchema,
  createShippingQuoteSchema,
} from "@shared/schemas/index.ts";
import {
  handleSuccess,
  requireBindings,
  requireVariables,
} from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";
import z from "zod";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createOrderHandler = createHandlers(
  zodValidatorMiddleware("json", createOrderSchema),
  async (c) => {
    const { supabaseService, claims, db } = requireVariables(
      c,
      "supabaseService",
      "claims",
      "db",
    );
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");
    const res = await OrderActions.createOrder(db, supabaseService, {
      profileId,
      payload,
      idempotencyKey,
    });
    return handleSuccess(res);
  },
);

export const payOrderHandler = createHandlers(
  zodValidatorMiddleware("json", payOrderSchema),
  zodValidatorMiddleware("param", z.object({ id: z.uuid() })),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const { APP_URL } = requireBindings(c, "APP_URL");
    const payload = c.req.valid("json");
    const { id: orderId } = c.req.valid("param");
    const idempotencyKey = c.req.header("Idempotency-Key");
    const res = await PaymentActions.payOrder(db, {
      payload,
      orderId,
      idempotencyKey,
      appURL: APP_URL,
    });
    return handleSuccess(res);
  },
);

export const createShippingQuoteHandler = createHandlers(
  zodValidatorMiddleware("json", createShippingQuoteSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const res = await OrderActions.createShippingQuotation(payload);
    return handleSuccess(res);
  },
);

export const paymentWebhookHandler = createHandlers(async (c) => {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header("Paymongo-Signature");
  const res = await PaymentActions.handlePaymentWebhook(
    rawBody,
    signatureHeader,
  );
  return handleSuccess(res);
});
