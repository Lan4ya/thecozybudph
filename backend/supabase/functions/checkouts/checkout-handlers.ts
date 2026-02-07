import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { handleSuccess } from "@shared/utils/mod.ts";
import { checkoutSchema } from "@shared/types/index.ts";
import { checkoutProduct } from "./checkout-product.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const checkoutHandler = createHandlers(
  zodValidatorMiddleware("json", checkoutSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const { sub: profileId } = c.get("claims");
    const payload = c.req.valid("json");
    const res = await checkoutProduct(supabase, payload, profileId);
    return handleSuccess(res);
  },
);
