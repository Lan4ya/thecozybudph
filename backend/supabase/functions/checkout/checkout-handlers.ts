import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { checkoutSchema } from "@shared/types/index.ts";
import { CheckoutService } from "@shared/domain/checkout/services/mod.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const checkoutHandler = createHandlers(
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
