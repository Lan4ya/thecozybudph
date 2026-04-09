import { Env, Hono } from "hono";
import { checkoutPaymongoWebhookHandler } from "./webhook-handlers.ts";

const webhook = new Hono<Env>();

// No authMiddleware since this is a public api
webhook.post("/checkout/paymongo", ...checkoutPaymongoWebhookHandler);

export default webhook;
