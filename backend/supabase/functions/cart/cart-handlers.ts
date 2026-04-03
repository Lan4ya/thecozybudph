import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { CartService } from "@shared/domain/cart/mod.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import {
  addCartItemSchema,
  cartItemIdSchema,
  deleteCartItemsSchema,
  updateCartItemSchema,
} from "@shared/types/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getCartItemsHandler = createHandlers(async (c) => {
  const { claims, db } = requireVariables(c, "claims", "db");
  const profileId = claims.sub;
  const res = await CartService.getCartItems(db, profileId);
  return handleSuccess(res);
});

export const addCartItemsHandler = createHandlers(
  zodValidatorMiddleware("json", addCartItemSchema),
  async (c) => {
    const { claims, db } = requireVariables(c, "claims", "db");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await CartService.addCartItem(db, payload, profileId);
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
    const res = await CartService.updateCartItem(db, cartItemId, payload);
    return handleSuccess(res);
  },
);

export const deleteCartItemsHandler = factory.createHandlers(
  zodValidatorMiddleware("json", deleteCartItemsSchema),
  async (c) => {
    const { claims, db, supabase } = requireVariables(
      c,
      "claims",
      "supabase",
      "db",
    );
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await CartService.deleteCartItems(
      db,
      supabase,
      payload,
      profileId,
    );
    return handleSuccess(res);
  },
);
