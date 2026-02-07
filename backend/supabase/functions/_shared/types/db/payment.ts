import type { Tables } from "./supabase.types.ts";

export type PaymentsRow = Tables<"payments">;

export type PaymentDBInsert = Omit<
  PaymentsRow,
  "id" | "created_at" | "updated_at"
>;

export type PaymentDBUpdate = Partial<
  Pick<
    PaymentsRow,
    "amount_cents" | "method" | "paid_at" | "payment_id" | "status"
  >
>;
