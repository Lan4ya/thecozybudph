import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
  supabaseServiceMiddleware,
} from "@shared/middlewares/mod.ts";
import { Env, Hono } from "hono";
import {
  createOrderHandler,
  payOrderHandler,
  createShippingQuoteHandler,
  paymentWebhookHandler,
} from "./checkout-handlers.ts";

const checkout = new Hono<Env>();

// Public
checkout.post("/webhook", ...paymentWebhookHandler);

// Protected
const protectedRoutes = new Hono<Env>();
protectedRoutes.use(
  "*",
  supabaseMiddleware(),
  authMiddleware(),
  supabaseServiceMiddleware(),
);

protectedRoutes.post("/order", drizzleMiddleware(), ...createOrderHandler);
protectedRoutes.post("/order/:id/pay", drizzleMiddleware(), ...payOrderHandler);
protectedRoutes.post("/shipping/quotes", ...createShippingQuoteHandler);

checkout.route("/", protectedRoutes);

export default checkout;
