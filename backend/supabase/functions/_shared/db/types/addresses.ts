import { InferInsertModel } from "drizzle-orm";
import { addresses } from "../schema/addresses.ts";

export type InsertAddress = InferInsertModel<typeof addresses>;
export type UpdateAddress = Partial<InsertAddress>;
