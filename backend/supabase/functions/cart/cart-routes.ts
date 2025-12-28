import { Hono, Env } from "hono";
import { supabaseMiddleware, authMiddleware } from "@shared/middlewares/mod.ts";
import {
  addCartItemsHandler,
  getCartItemsHandler,
  deleteCartItemsHandler,
} from "./cart-handlers.ts";

const cart = new Hono<Env>();

cart.use("*", supabaseMiddleware());
cart.use("*", authMiddleware());

cart.get("/items", ...getCartItemsHandler);
cart.post("/item", ...addCartItemsHandler);
cart.delete("/items", ...deleteCartItemsHandler);

export default cart;
