import { PaymentActions } from "@shared/modules/payment/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";
import { uuidParamSchema } from "@shared/package-types/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getPaymentStatusHandler = createHandlers(
  zodValidatorMiddleware("param", uuidParamSchema("id")),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const { id: paymentId } = c.req.valid("param");
    const res = await PaymentActions.getPaymentStatus(db, paymentId);
    return handleSuccess(res);
  },
);
