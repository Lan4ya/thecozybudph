import { InferInsertModel } from "drizzle-orm";
import { addresses } from "../schema/addresses.ts";

export type AddressInsert = InferInsertModel<typeof addresses>;
export type AddressUpdate = Partial<AddressInsert>;
