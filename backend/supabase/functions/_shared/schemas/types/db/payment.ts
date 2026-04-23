import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import type { Tables } from "./supabase.types.ts";

export type PaymentsRow = Tables<"payments">;

export type CreatePendingPaymentDBInput = SnakeToCamel<
  Omit<PaymentsRow, "id" | "created_at" | "updated_at" | "order_id">
>;
export type PaymentDBUpdate = Partial<
  Pick<
    PaymentsRow,
    "amount_cents" | "method" | "paid_at" | "payment_id" | "status"
  >
>;
