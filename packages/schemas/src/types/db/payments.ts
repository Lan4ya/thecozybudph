import { InferInsertModel } from "drizzle-orm";
import { payments } from "@TheCozyBud/schemas";

export type InsertPayment = Omit<
  InferInsertModel<typeof payments>,
  "id" | "paidAt" | "paymentId" | "status" | "isActive"
>;

export type UpdatePayment = Partial<InferInsertModel<typeof payments>>;
