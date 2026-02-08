import { AddressesRow } from "../db/index.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

export type Address = SnakeToCamel<Omit<AddressesRow, "created_at">>;
