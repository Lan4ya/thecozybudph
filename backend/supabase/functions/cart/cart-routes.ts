import { Hono, Env } from "hono";
import {
  supabaseMiddleware,
  authMiddleware,
  drizzleMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  addCartItemsHandler,
  getCartItemsHandler,
  deleteCartItemsHandler,
  updateCartItemsVariantHandler,
} from "./cart-handlers.ts";

const cart = new Hono<Env>();

cart.use("*", supabaseMiddleware());
cart.use("*", authMiddleware());
cart.use("*", drizzleMiddleware());

cart.get("/items", ...getCartItemsHandler);
cart.post("/items", ...addCartItemsHandler);
cart.patch("/items/:id", ...updateCartItemsVariantHandler);
cart.delete("/items", ...deleteCartItemsHandler);

export default cart;
