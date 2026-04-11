import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import { Env, Hono } from "hono";
import {
  createOrderHandler,
  createPaymentHandler,
  createShippingQuoteHandler,
  paymentWebhookHandler,
} from "./checkout-handlers.ts";

const checkout = new Hono<Env>();

// Public
checkout.post("/webhook", ...paymentWebhookHandler);

// Protected
const protectedRoutes = new Hono<Env>();
protectedRoutes.use("*", supabaseMiddleware(), authMiddleware());

protectedRoutes.post("/order", drizzleMiddleware(), ...createOrderHandler);
protectedRoutes.post("/payment", drizzleMiddleware(), ...createPaymentHandler);
protectedRoutes.post("/shipping/quotes", ...createShippingQuoteHandler);

checkout.route("/", protectedRoutes);

export default checkout;
