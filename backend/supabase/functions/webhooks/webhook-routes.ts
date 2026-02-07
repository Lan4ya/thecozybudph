import { Hono, Env } from "hono";
import { supabaseMiddleware } from "@shared/middlewares/mod.ts";
import { checkoutPaymongoWebhookHandler } from "./webhook-handlers.ts";

const webhook = new Hono<Env>();

webhook.use("*", supabaseMiddleware());

// INFO: no authMiddleware since it's a public api, verifyJwt is also set to false in supabase/config.toml

webhook.post("/checkout/paymongo", ...checkoutPaymongoWebhookHandler);

export default webhook;
