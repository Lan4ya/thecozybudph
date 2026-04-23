import { InferInsertModel } from "drizzle-orm";
import { addresses } from "@TheCozyBud/schemas";

export type InsertAddress = InferInsertModel<typeof addresses>;
export type UpdateAddress = Partial<InsertAddress>;
