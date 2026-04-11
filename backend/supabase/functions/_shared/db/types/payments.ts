import { InferInsertModel } from "drizzle-orm";
import { payments } from "../schema/payments.ts";

export type InsertPayment = Omit<
  InferInsertModel<typeof payments>,
  "id" | "paidAt" | "paymentId"
>;

export type UpdatePayment = Partial<InferInsertModel<typeof payments>>;
