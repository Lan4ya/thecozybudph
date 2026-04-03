import { InferInsertModel } from "drizzle-orm";
import { payments } from "../schema/payments.ts";

export type PaymentInsert = InferInsertModel<typeof payments>;
