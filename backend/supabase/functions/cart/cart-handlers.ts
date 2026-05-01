import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { CartActions } from "@shared/modules/cart/mod.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import {
  addCartItemSchema,
  cartItemIdSchema,
  deleteCartItemsSchema,
  updateCartItemSchema,
} from "@shared/schemas/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getCartItemsHandler = createHandlers(async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const res = await CartActions.getCartItems(db, profileId);
  return handleSuccess(res);
});

export const addCartItemsHandler = createHandlers(
  zodValidatorMiddleware("json", addCartItemSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await CartActions.addCartItem(db, payload, profileId);
    return handleSuccess(res);
  },
);

export const updateCartItemsVariantHandler = createHandlers(
  zodValidatorMiddleware("param", cartItemIdSchema),
  zodValidatorMiddleware("json", updateCartItemSchema),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const { id: cartItemId } = c.req.valid("param");
    const payload = c.req.valid("json");
    const res = await CartActions.updateCartItem(db, cartItemId, payload);
    return handleSuccess(res);
  },
);

export const deleteCartItemsHandler = factory.createHandlers(
  zodValidatorMiddleware("json", deleteCartItemsSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await CartActions.deleteCartItems(db, payload, profileId);
    return handleSuccess(res);
  },
);
