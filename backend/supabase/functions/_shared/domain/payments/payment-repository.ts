import type { PaymentDBInsert, PaymentDBUpdate } from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { AppError } from "../../errors/Errors.ts";

export const PaymentRepository = {
  insertPayment: async (supabase: SupabaseType, payment: PaymentDBInsert) => {
    const { data, error } = await supabase
      .from("payments")
      .insert(payment)
      .select("*")
      .single();

    if (error) {
      AppError.internal(error.message);
    }

    if (!data) {
      throw AppError.internal(
        "Invariant violation: payment insert returned no data",
      );
    }

    return data;
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

    if (error) {
      throw AppError.internal(
        "updating payment to failed failed",
        error.message,
      );
    }

    if (!data) {
      throw AppError.conflict(
        "Payment not updated: no pending payment found for payment_intent_id",
      );
    }

    return data;
  },
};
