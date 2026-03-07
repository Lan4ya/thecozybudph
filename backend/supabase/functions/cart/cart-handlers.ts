import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { CartService } from "@shared/domain/cart/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import {
  addCartItemSchema,
  cartItemIdSchema,
  deleteCartItemsSchema,
  updateCartItemSchema,
} from "@shared/types/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getCartItemsHandler = createHandlers(async (c) => {
  const supabase = c.get("supabase");
  const { sub } = c.get("claims");
  const profileId = sub;
  const res = await CartService.getCartItems(supabase, profileId);
  return handleSuccess(res);
});

export const addCartItemsHandler = createHandlers(
  zodValidatorMiddleware("json", addCartItemSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const { sub } = c.get("claims");
    const profileId = sub;
    const payload = c.req.valid("json");
    const res = await CartService.addCartItem(supabase, payload, profileId);
    return handleSuccess(res);
  },
);

export const updateCartItemsVariantHandler = createHandlers(
  zodValidatorMiddleware("param", cartItemIdSchema),
  zodValidatorMiddleware("json", updateCartItemSchema),
  async (c) => {
    const { id: cartItemId } = c.req.valid("param");
    const payload = c.req.valid("json");
    const res = await CartService.updateCartItem(cartItemId, payload);
    return handleSuccess(res);
  },
);

export const deleteCartItemsHandler = factory.createHandlers(
  zodValidatorMiddleware("json", deleteCartItemsSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const { sub } = c.get("claims");
    const profileId = sub;
    const payload = c.req.valid("json");
    const res = await CartService.deleteCartItems(supabase, payload, profileId);
    return handleSuccess(res);
  },
);
