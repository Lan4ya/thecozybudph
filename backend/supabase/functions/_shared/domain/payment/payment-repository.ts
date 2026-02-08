import type { PaymentDBInsert, PaymentDBUpdate } from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const PaymentRepository = {
  insertPayment: async (supabase: SupabaseType, payment: PaymentDBInsert) => {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select("*")
      .single();

    return { data, error };
  },

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
