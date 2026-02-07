import { Hono, Env } from "hono";
import { supabaseMiddleware, authMiddleware } from "@shared/middlewares/mod.ts";
import { checkoutHandler } from "./checkout-handlers.ts";

const checkout = new Hono<Env>();

checkout.use("*", supabaseMiddleware());

checkout.post("/", authMiddleware(), ...checkoutHandler);

export default checkout;
