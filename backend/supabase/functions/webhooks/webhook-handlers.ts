import { createFactory } from "hono/factory";
import { handleSuccess } from "@shared/utils/mod.ts";
import { handlePayMongoWebhook } from "./paymongo/handle-paymongo.ts";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const checkoutPaymongoWebhookHandler = createHandlers(async (c) => {
  const supabase = c.get("supabase");
  // const { sub: profileId } = c.get("claims");
  const signatureHeader = c.req.header("Paymongo-Signature");
  const rawBody = await c.req.text();
  const res = await handlePayMongoWebhook(supabase, rawBody, signatureHeader!);
  return handleSuccess(res);
});
