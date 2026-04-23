import {
  authMiddleware,
  drizzleMiddleware,
  supabaseMiddleware,
} from "@shared/middlewares/mod.ts";
import { Env, Hono } from "hono";
import { getPaymentStatusHandler } from "./payment-handlers.ts";

const payment = new Hono<Env>();

payment.use("*", supabaseMiddleware(), authMiddleware(), drizzleMiddleware());

payment.get("/:id/status", ...getPaymentStatusHandler);

export default payment;
