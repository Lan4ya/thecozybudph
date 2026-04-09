import { CheckoutService } from "@shared/domain/checkout/services/mod.ts";
import { LalamoveService } from "@shared/domain/lalamove/services/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import {
  checkoutSchema,
  createShippingQuoteSchema,
} from "@shared/types/index.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createPendingCheckoutHandler = createHandlers(
  zodValidatorMiddleware("json", checkoutSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const idempotencyKey = c.req.header("Idempotency-Key");
    const res = await CheckoutService.createPendingCheckout(
      db,
      profileId,
      payload,
      idempotencyKey,
    );
    return handleSuccess(res);
  },
);

export const createShippingQuoteHandler = createHandlers(
  zodValidatorMiddleware("json", createShippingQuoteSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const res = await LalamoveService.createQuotations(payload);
    return handleSuccess(res);
  },
);
