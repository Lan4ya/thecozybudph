// curl -X POST https://your-domain/functions/v1/internal/reconcile-payments \
//   -H "x-internal-secret: supersecret123"

import { Hono } from "hono";
import { supabase } from "../../_shared/supabaseClient.ts";
import { paymongoClient } from "../../_shared/domain/payment/paymongo/client.ts";

const app = new Hono();

app.post("/internal/reconcile-payments", async (c) => {
  const secret = c.req.header("x-internal-secret");
  if (secret !== Deno.env.get("RECONCILE_SECRET")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 1️⃣ fetch pending payments from DB
  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "pending");

  const updates = [];

  for (const payment of pendingPayments ?? []) {
    try {
      // 2️⃣ fetch latest status from PayMongo
      const res = await paymongoClient.get(
        `/payment_intents/${payment.payment_intent_id}`,
      );
      const status = res.data.data.attributes.status;

      // 3️⃣ update DB if different
      if (status === "succeeded" && payment.status !== "paid") {
        await supabase
          .from("payments")
          .update({ status: "paid" })
          .eq("id", payment.id);
        updates.push({ id: payment.id, status: "paid" });
      } else if (status === "failed" && payment.status !== "failed") {
        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);
        updates.push({ id: payment.id, status: "failed" });
      }
    } catch (err) {
      console.error("Reconcile error for payment", payment.id, err);
    }
  }

  return c.json({ success: true, updated: updates.length, details: updates });
});

export default app;
