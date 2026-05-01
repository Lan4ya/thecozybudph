import { InferInsertModel } from "drizzle-orm";
import { addresses } from "../../drizzle/index.ts";

export type InsertAddress = InferInsertModel<typeof addresses>;
export type UpdateAddress = Partial<InsertAddress>;
