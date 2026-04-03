import { Hono, Env } from "hono";
import {
  supabaseMiddleware,
  authMiddleware,
  drizzleMiddleware,
} from "@shared/middlewares/mod.ts";
import { checkoutHandler } from "./checkout-handlers.ts";

const checkout = new Hono<Env>();

checkout.use("*", supabaseMiddleware());
checkout.use("*", authMiddleware());
checkout.use("*", drizzleMiddleware());

checkout.post("/", ...checkoutHandler);

export default checkout;
