import type { PaymentDBUpdate } from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const PaymentRepository = {
  updatePayment: async (
    supabase: SupabaseType,
    paymentIntentId: string,
    paymentUpdate: PaymentDBUpdate,
  ) => {
    const { data, error } = await supabase
      .from("payments")
      .update(paymentUpdate)
      .eq("payment_intent_id", paymentIntentId)
      .in("status", ["pending"])
      .select()
      .maybeSingle();

    return { data, error };
  },
};
